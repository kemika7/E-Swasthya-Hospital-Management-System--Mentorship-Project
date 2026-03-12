const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register Patient
router.post('/register', async (req, res) => {
    const { name, email, password, phone, address, dob, age, gender, medical_history } = req.body;

    try {
        // Check if patient exists in patients table
        const [existingPatient] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        if (existingPatient.length > 0) {
            return res.status(400).json({ message: 'Patient already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into patients table
        const profile_pic = req.body.profile_pic || '/images/default-avatar.png';
        const status = 'Active';

        const calculatedAge = age || (dob ? Math.floor((new Date() - new Date(dob)) / 31557600000) : 0);
        const [result] = await db.execute(
            'INSERT INTO patients (name, email, password, phone, age, gender, address, medical_history, status, profile_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, calculatedAge, gender || 'Other', address || null, medical_history || 'N/A', status, profile_pic]
        );

        res.status(201).json({ message: 'Patient registered successfully', patientId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Register Doctor
router.post('/register-doctor', async (req, res) => {
    const { name, email, password, phone, address, regNumber, specialization, hospital } = req.body;

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
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'doctor']
        );
        const userId = userResult.insertId;

        // Insert into doctors
        const [doctorResult] = await connection.execute(`
            INSERT INTO doctors (user_id, specialty_id, specialization, hospital, location) 
            VALUES (?, ?, ?, ?, ?)
        `, [userId, specialty_id, specialization, hospital, address]);
        const doctorId = doctorResult.insertId;

        await connection.commit();

        // Generate JWT
        const token = jwt.sign(
            { id: userId, roleId: doctorId, name, role: 'doctor' },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Doctor registered successfully',
            token,
            user: { id: userId, roleId: doctorId, name, email, role: 'doctor' }
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

module.exports = router;
