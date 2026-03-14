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

// Generate 6-digit OTP
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n=============================\n[DEV] Generated OTP: ${otp}\n=============================\n`);
    return otp;
};

// Register Patient
router.post('/register', async (req, res) => {
    const { name, email, password, phone, address, dob, age, gender, medical_history } = req.body;

    try {
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

        // Check if patient exists in patients table
        const [existingPatient] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        if (existingPatient.length > 0) {
            return res.status(400).json({ message: 'Patient already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into patients table (Unverified)
        const profile_pic = req.body.profile_pic || '/images/default-avatar.png';
        const status = 'Active';

        const [result] = await db.execute(
            'INSERT INTO patients (name, email, password, phone, age, gender, address, medical_history, status, profile_pic, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)',
            [name, email, hashedPassword, phone || null, calculatedAge, gender || 'Other', address || null, medical_history || 'N/A', status, profile_pic]
        );

        // Generate and send OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes
        await db.execute('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [email, otp, 'registration', expiresAt]);
        await sendOTP(email, otp, 'registration');

        res.status(201).json({ message: 'Registration initiated. Please verify your OTP sent to email.', requireOtp: true, email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Register Doctor
router.post('/register-doctor', async (req, res) => {
    const { name, email, password, phone, address, regNumber, specialization, hospital } = req.body;

    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 8 chars, with 1 upper, 1 lower, 1 number, and 1 special char.' });
    if (password.toLowerCase() === email.toLowerCase() || password.toLowerCase() === name.toLowerCase()) {
        return res.status(400).json({ message: 'Password cannot be the same as email or name.' });
    }
    if (phone && !validatePhone(phone)) return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });


    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Check if user exists
        const [existingUser] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Find specialty
        const [specialties] = await connection.execute('SELECT id FROM specialties WHERE name = ?', [specialization]);
        let specialty_id = specialties.length > 0 ? specialties[0].id : null;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into users
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, FALSE)',
            [name, email, hashedPassword, 'doctor']
        );
        const userId = userResult.insertId;

        // Insert into doctors
        const [doctorResult] = await connection.execute(`
            INSERT INTO doctors (user_id, specialty_id, specialization, hospital, location) 
            VALUES (?, ?, ?, ?, ?)
        `, [userId, specialty_id, specialization, hospital, address]);
        const doctorId = doctorResult.insertId;

        // Generate and send OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes
        await connection.execute('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [email, otp, 'registration', expiresAt]);
        await sendOTP(email, otp, 'registration');

        await connection.commit();

        res.status(201).json({
            message: 'Registration initiated. Please verify your OTP sent to email.',
            requireOtp: true,
            email,
            role: 'doctor'
        });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    } finally {
        connection.release();
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
            user.id = user.patient_id; // For JWT consistency
        } else {
            const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            user = users[0];
        }

        // Check if user is verified
        if (!user.is_verified) {
             // Resend OTP logic could go here, or we just prompt them
             return res.status(403).json({ message: 'Account not verified. Please verify your email first.', requireOtp: true, email: user.email });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

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
            { id: role === 'patient' ? null : user.id, roleId, name: user.name, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: role === 'patient' ? null : user.id,
                roleId,
                name: user.name,
                email: user.email,
                role: user.role
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
            { expiresIn: '24h' }
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
                    { expiresIn: '24h' }
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

// Forgot Password -> Request OTP
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        // Check if user exists
        const [patients] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (patients.length === 0 && users.length === 0) {
            return res.status(404).json({ message: 'No account found with that email address.' });
        }

        // Generate and send OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes
        await db.execute('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [email, otp, 'reset', expiresAt]);
        await sendOTP(email, otp, 'reset-password');

        res.json({ message: 'Password reset OTP sent to email.', email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});

// Resend password reset or register OTP
router.post('/resend-otp', async (req, res) => {
    const { email, type = 'registration' } = req.body;
    try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes
        
        // Remove existing active OTPs for this user/type to avoid spam
        await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, type]);
        
        await db.execute('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [email, otp, type, expiresAt]);
        await sendOTP(email, otp, type === 'registration' ? 'registration' : 'reset-password');

        res.json({ message: 'New OTP sent successfully.' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error resending OTP.' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        if (!validatePassword(newPassword)) return res.status(400).json({ message: 'Password must be at least 8 chars, with 1 upper, 1 lower, 1 number, and 1 special char.' });

        const [otps] = await db.execute('SELECT * FROM otps WHERE email = ? AND otp = ? AND type = ? ORDER BY created_at DESC LIMIT 1', [email, otp, 'reset']);
        
        if (otps.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        const otpRecord = otps[0];
        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update in both potential tables (only exists in one, but safe to update)
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
        await db.execute('UPDATE patients SET password = ? WHERE email = ?', [hashedPassword, email]);

        // Clean up OTPs
        await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'reset']);

        res.json({ message: 'Password reset successfully. You can now log in.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

module.exports = router;
