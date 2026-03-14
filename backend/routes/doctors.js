const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all doctors with filtering support
router.get('/', async (req, res) => {
    try {
        const { category_id, specialty_id } = req.query;
        let query = `
            SELECT d.*, u.name as doctor_name, u.email, 
                   s.name as specialty_name, c.name as category_name
            FROM doctors d 
            JOIN users u ON d.user_id = u.id
            LEFT JOIN specialties s ON d.specialty_id = s.id
            LEFT JOIN medical_categories c ON s.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (category_id) {
            query += ' AND c.id = ?';
            params.push(category_id);
        }
        if (specialty_id) {
            query += ' AND s.id = ?';
            params.push(specialty_id);
        }

        const [doctors] = await db.execute(query, params);
        res.json(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
});

// Get all medical categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM medical_categories WHERE status = "Active"');
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// Get specialties by category
router.get('/specialties/:categoryId', async (req, res) => {
    try {
        const [specialties] = await db.execute('SELECT * FROM specialties WHERE category_id = ? AND status = "Active"', [req.params.categoryId]);
        res.json(specialties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching specialties' });
    }
});

// Get specific doctor profile
router.get('/:id', async (req, res) => {
    try {
        const [doctor] = await db.execute(`
            SELECT d.*, u.name as doctor_name, u.email, 
                   s.name as specialty_name, c.name as category_name
            FROM doctors d 
            JOIN users u ON d.user_id = u.id
            LEFT JOIN specialties s ON d.specialty_id = s.id
            LEFT JOIN medical_categories c ON s.category_id = c.id
            WHERE d.id = ?
        `, [req.params.id]);

        if (doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(doctor[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching doctor' });
    }
});

// Get logged in doctor profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [doctor] = await db.execute(`
            SELECT d.*, u.name, u.email, u.role
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE u.id = ?
        `, [userId]);

        if (doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        res.json(doctor[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});



// Create doctor (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, email, password, specialty_id, specialization, experience, hospital, bio, location, working_hours, fee } = req.body;

        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'password123', salt);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, 'doctor']
            );
            const userId = userResult.insertId;

            await connection.execute(`
                INSERT INTO doctors (user_id, specialty_id, specialization, experience, hospital, bio, location, working_hours, fee) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [userId, specialty_id, specialization, experience, hospital, bio, location, working_hours, fee]);

            await connection.commit();
            res.status(201).json({ message: 'Doctor created successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating doctor' });
    }
});

// Update logged in doctor profile (Doctor only)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied. Only doctors can update their own profile.' });

        const userId = req.user.id;
        const { name, specialization, location, dob, blood_group, working_hours } = req.body;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Update name in users table if provided
            if (name) {
                await connection.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
            }

            // Define allowable fields for the doctors table
            let doctorQuery = 'UPDATE doctors SET ';
            let params = [];
            let setClauses = [];

            if (specialization !== undefined) { setClauses.push('specialization = ?'); params.push(specialization); }
            if (location !== undefined) { setClauses.push('location = ?'); params.push(location); }
            if (dob !== undefined) { setClauses.push('dob = ?'); params.push(dob); }
            if (blood_group !== undefined) { setClauses.push('blood_group = ?'); params.push(blood_group); }
            if (working_hours !== undefined) { setClauses.push('working_hours = ?'); params.push(working_hours); }

            if (setClauses.length > 0) {
                doctorQuery += setClauses.join(', ') + ' WHERE user_id = ?';
                params.push(userId);
                await connection.execute(doctorQuery, params);
            }

            await connection.commit();
            res.json({ message: 'Profile updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// Update doctor
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, specialty_id, specialization, experience, hospital, bio, location, working_hours, fee } = req.body;
        const doctorId = req.params.id;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [d] = await connection.execute('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
            if (d.length === 0) return res.status(404).json({ message: 'Doctor not found' });

            const userId = d[0].user_id;

            if (name) await connection.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);

            await connection.execute(`
                UPDATE doctors 
                SET specialty_id = ?, specialization = ?, experience = ?, hospital = ?, bio = ?, location = ?, working_hours = ?, fee = ?
                WHERE id = ?
            `, [specialty_id, specialization, experience, hospital, bio, location, working_hours, fee, doctorId]);

            await connection.commit();
            res.json({ message: 'Doctor updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating doctor' });
    }
});

// Delete doctor
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const [d] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [req.params.id]);
        if (d.length === 0) return res.status(404).json({ message: 'Doctor not found' });

        await db.execute('DELETE FROM users WHERE id = ?', [d[0].user_id]);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting doctor' });
    }
});

module.exports = router;
