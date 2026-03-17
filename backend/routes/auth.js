const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendOTP } = require('../utils/mailer');
const crypto = require('crypto');

// Validation Helpers
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
const validatePhone = (phone) => /^\d{10}$/.test(phone);
const validateFullName = (name) => name && name.trim().includes(' ');

// Capitalize first letter of each part of the name
const formatName = (name) => {
    if (!name) return '';
    return name
        .trim()
        .split(/\s+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
};

// Generate 6-digit OTP
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n=============================\n[DEV] Generated OTP: ${otp}\n=============================\n`);
    return otp;
};

// Register Patient (no OTP - direct registration)
router.post('/register', async (req, res) => {
    let { name, email, password, phone, address, dob, age, gender, medical_history } = req.body;

    try {
        if (!validateFullName(name)) return res.status(400).json({ message: 'Please provide your full name (first and last name).' });
        name = formatName(name);

        if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
        if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 8 chars, with 1 upper, 1 lower, 1 number, and 1 special char.' });

        const calculatedAge = age || (dob ? Math.floor((new Date() - new Date(dob)) / 31557600000) : 0);
        if (calculatedAge < 18) {
            return res.status(400).json({ message: 'You must be at least 18 years old to register.' });
        }
        if (password.toLowerCase() === email.toLowerCase() || password.toLowerCase() === name.toLowerCase()) {
            return res.status(400).json({ message: 'Password cannot be the same as email or name.' });
        }
        if (phone && !validatePhone(phone)) return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });

        // Check if account already exists with this email or phone
        const [existingEmailInPatients] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        const [existingEmailInUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmailInPatients.length > 0 || existingEmailInUsers.length > 0) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        if (phone) {
            const [existingPhoneInPatients] = await db.execute('SELECT * FROM patients WHERE phone = ?', [phone]);
            const [existingPhoneInUsers] = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
            if (existingPhoneInPatients.length > 0 || existingPhoneInUsers.length > 0) {
                return res.status(400).json({ message: 'An account with this phone number already exists.' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert patient as immediately verified - no OTP required
        const profile_pic = req.body.profile_pic || '/images/default-avatar.png';

        const [result] = await db.execute(
            'INSERT INTO patients (name, email, password, phone, age, gender, address, medical_history, status, profile_pic, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
            [name, email, hashedPassword, phone || '', calculatedAge, gender || 'Other', address || '', medical_history || 'N/A', 'Active', profile_pic]
        );

        const patientId = result.insertId;

        // Auto-login: issue JWT token so patient goes straight to dashboard
        const token = jwt.sign(
            { id: null, roleId: patientId, name, role: 'patient' },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Registration successful! Welcome to E-Swasthya.',
            token,
            user: { id: null, roleId: patientId, name, email, role: 'patient' }
        });
    } catch (err) {
        console.error('[REGISTER ERROR]', err.message, err.code || '', err.sqlMessage || '');
        res.status(500).json({ message: 'Server error during registration', detail: err.message });
    }
});



// Login User
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    console.log('Login attempt:', { email, role, passwordProvided: !!password });

    try {
        let user;
        if (role === 'patient') {
            const [patients] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
            if (patients.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            user = patients[0];
            user.role = 'patient';
            user.id = user.patient_id;
        } else {
            // Support Email OR Doctor ID (DOC-1) login
            if (email.startsWith('DOC-')) {
                const doctorId = email.replace('DOC-', '');
                console.log(`[LOGIN] Attempting Doctor ID login: ${doctorId}`);
                const [doctors] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
                if (doctors.length === 0) {
                    console.log(`[LOGIN] Doctor ID ${doctorId} not found in doctors table`);
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
                const userId = doctors[0].user_id;
                const [users] = await db.execute('SELECT * FROM users WHERE id = ? AND role = ?', [userId, role]);
                if (users.length === 0) {
                    console.log(`[LOGIN] User ID ${userId} not found in users table with role ${role}`);
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
                user = users[0];
            } else {
                console.log(`[LOGIN] Attempting Email login: ${email}`);
                const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
                if (users.length === 0) {
                    console.log(`[LOGIN] Email ${email} not found in users table with role ${role}`);
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
                user = users[0];
            }

            // JOIN with hospitals to get the name
            try {
              const [hospRows] = await db.execute('SELECT name FROM hospitals WHERE id = ?', [user.hospital_id]);
              user.hospital_name = hospRows.length > 0 ? hospRows[0].name : null;
            } catch (_) {
              user.hospital_name = null;
            }
        }

        // OTP verification removed for easier login

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`[LOGIN] Password mismatch for ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log(`[LOGIN] Password match for ${email}`);

        // Fetch role-specific ID
        let roleId = null;
        if (role === 'patient') {
            roleId = user.patient_id;
        } else if (role === 'doctor') {
            const [d] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
            roleId = d[0]?.id;
        }

        // Generate JWT
        const token = jwt.sign(
            { 
                id: role === 'patient' ? null : user.id, 
                roleId, 
                name: user.name, 
                role: user.role, 
                hospital_id: user.hospital_id,
                hospital_name: user.hospital_name
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: role === 'patient' ? null : user.id,
                roleId,
                name: user.name,
                email: user.email,
                role: user.role,
                hospital_id: user.hospital_id,
                hospital_name: user.hospital_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Google Login
router.post('/google-login', async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Check if patient exists
        let [patients] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        let patient;

        if (patients.length === 0) {
            // Create patient for Google login
            const [result] = await db.execute(
                'INSERT INTO patients (name, email, role, password, phone, age, gender, address, medical_history, profile_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, 'patient', 'GOOGLE_AUTH', 'N/A', 0, 'Other', 'N/A', 'N/A', '/images/default-avatar.png']
            );
            const patientId = result.insertId;
            [patients] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
            patient = patients[0];
        } else {
            patient = patients[0];
        }

        const roleId = patient.patient_id;

        // Generate JWT
        const token = jwt.sign(
            { id: null, roleId, name: patient.name, role: 'patient' },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: null,
                roleId,
                name: patient.name,
                email: patient.email,
                role: 'patient'
            }
        });

    } catch (err) {
        console.error('Google Verify Error:', err);
        res.status(401).json({ message: 'Invalid Google token' });
    }
});

// OTP Verification endpoint
router.post('/verify-otp', async (req, res) => {
    const { email, otp, type = 'registration' } = req.body;

    try {
        const [otps] = await db.execute('SELECT * FROM otps WHERE email = ? AND otp = ? AND type = ? ORDER BY created_at DESC LIMIT 1', [email, otp, type]);

        if (otps.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        const otpRecord = otps[0];
        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        // Mark as verified
        if (type === 'registration') {
            await db.execute('UPDATE users SET is_verified = TRUE WHERE email = ?', [email]);
            await db.execute('UPDATE patients SET is_verified = TRUE WHERE email = ?', [email]);

            // Generate auth token so user doesn't need to log in again immediately
            let user = null;
            let roleId = null;

            const [patients] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
            if (patients.length > 0) {
                user = patients[0];
                user.role = 'patient';
                roleId = user.patient_id;
            } else {
                const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
                if (users.length > 0) {
                    user = users[0];
                    if (user.role === 'doctor') {
                        const [d] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
                        roleId = d[0]?.id;
                    }
                }
            }

            if (user) {
                const token = jwt.sign(
                    { id: user.role === 'patient' ? null : user.id, roleId, name: user.name, role: user.role },
                    process.env.JWT_SECRET || 'your_jwt_secret_key',
                    { expiresIn: '1h' }
                );

                // Clear OTP
                await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'registration']);

                return res.json({
                    message: 'Account verified successfully.',
                    token,
                    user: {
                        id: user.role === 'patient' ? null : user.id,
                        roleId,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        }
        res.json({ message: 'OTP verified successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during verification' });
    }
});


// Resend registration OTP
router.post('/resend-otp', async (req, res) => {
    const { email, type = 'registration' } = req.body;
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const [existing] = await db.execute('SELECT * FROM otps WHERE email = ? AND type = ?', [email, type]);
        if (existing.length > 0) {
            await db.execute('UPDATE otps SET otp = ?, expires_at = ? WHERE email = ? AND type = ?', [otp, expiresAt, email, type]);
        } else {
            await db.execute('INSERT INTO otps (email, otp, expires_at, type) VALUES (?, ?, ?, ?)', [email, otp, expiresAt, type]);
        }

        const { sendOTPEmail } = require('../utils/mailer');
        await sendOTPEmail(email, otp);

        res.json({ message: 'OTP resent successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during OTP resend' });
    }
});

// Forgot Password -> Send Reset Link (JWT)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        // Generic response as requested: "If your email exists, a reset link has been sent."
        const genericResponse = { message: 'If your email exists, a reset link has been sent.' };

        // Check if user exists
        const [patients] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (patients.length === 0 && users.length === 0) {
            // Even if user doesn't exist, we send generic response for security
            return res.json(genericResponse);
        }

        // Generate short-lived reset token (15 minutes)
        const resetToken = jwt.sign(
            { email, purpose: 'password-reset' },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '15m' }
        );

        const { sendResetLink } = require('../utils/mailer');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        await sendResetLink(email, resetLink);

        res.json(genericResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});

// Reset Password (JWT)
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token) return res.status(400).json({ message: 'Reset token is required.' });
        if (!validatePassword(newPassword)) return res.status(400).json({ message: 'Password must be at least 8 chars, with 1 upper, 1 lower, 1 number, and 1 special char.' });

        // Verify JWT
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        } catch (jwtErr) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }

        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({ message: 'Invalid token purpose.' });
        }

        const email = decoded.email;

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update in both potential tables
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
        await db.execute('UPDATE patients SET password = ? WHERE email = ?', [hashedPassword, email]);

        // In production, you'd invalidate the token by adding to a blacklist or using a 'jti' 
        // with a database check, but standard short-lived JWTs are often used this way.

        res.json({ message: 'Password reset successfully. You can now log in.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

module.exports = router;
