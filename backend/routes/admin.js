const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Helper to ensure admin role
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// GET /api/admin/categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM medical_categories WHERE status = "Active"');
        res.json(categories);
    } catch (err) {
        console.error('[ADMIN API] Error fetching categories:', err);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// GET /api/admin/hospitals
router.get('/hospitals', async (req, res) => {
    try {
        const [hospitals] = await db.execute('SELECT * FROM hospitals ORDER BY name');
        res.json(hospitals);
    } catch (err) {
        console.error('[ADMIN API] Error fetching hospitals:', err);
        res.status(500).json({ message: 'Server error fetching hospitals' });
    }
});

// GET /api/admin/specializations (User requested name for specialties)
router.get('/specializations', async (req, res) => {
    try {
        const [specs] = await db.execute('SELECT * FROM specialties WHERE status = "Active"');
        res.json(specs);
    } catch (err) {
        console.error('[ADMIN API] Error fetching specializations:', err);
        res.status(500).json({ message: 'Server error fetching specializations' });
    }
});

// GET /api/admin/doctors
router.get('/doctors', authenticateToken, isAdmin, async (req, res) => {
    try {
        let query = `
            SELECT d.*, u.name as doctor_name, u.email, u.phone,
                   s.name as specialty_name, c.name as category_name,
                   h.name as hospital_name
            FROM doctors d 
            JOIN users u ON d.user_id = u.id
            LEFT JOIN specialties s ON d.specialty_id = s.id
            LEFT JOIN medical_categories c ON s.category_id = c.id
            LEFT JOIN hospitals h ON d.hospital_id = h.id
            WHERE 1=1
        `;
        const params = [];

        // Optional hospital filter from query if admin is super
        if (req.query.hospital_id) {
            query += ' AND d.hospital_id = ?';
            params.push(req.query.hospital_id);
        } else if (req.user.hospital_id) {
            // Normal admin restricted to their hospital
            query += ' AND d.hospital_id = ?';
            params.push(req.user.hospital_id);
        }

        const [doctors] = await db.execute(query, params);
        res.json(doctors);
    } catch (err) {
        console.error('[ADMIN API] Error fetching doctors:', err);
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
});

// POST /api/admin/add-doctor
router.post('/add-doctor', authenticateToken, isAdmin, async (req, res) => {
    console.log('[DEBUG] add-doctor body:', req.body);
    try {
        const { 
            name, email, phone, password, 
            specialization_id, specialty_id, // accept both names
            hospital_id: bodyHospitalId,
            experience, bio, location, working_hours, fee, qualification, rating,
            availability, unavailable_dates
        } = req.body;

        const hospital_id = bodyHospitalId || req.user.hospital_id;
        const final_specialty_id = specialization_id || specialty_id || null;

        if (!name || !email || !hospital_id) {
            return res.status(400).json({ error: 'Missing required fields: name, email, and hospital_id' });
        }

        // Uniqueness checks
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'Doctor@123', salt);
        const formattedName = name.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                'INSERT INTO users (name, email, phone, password, role, hospital_id, is_verified) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
                [formattedName, email.trim(), phone ? phone.trim() : '', hashedPassword, 'doctor', hospital_id]
            );
            const userId = userResult.insertId;

            await connection.execute(`
                INSERT INTO doctors (user_id, specialty_id, experience, bio, location, working_hours, fee, hospital_id, qualification, rating, availability, unavailable_dates, phone) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId, final_specialty_id, experience || 0, bio || '', 
                location || 'Kathmandu', working_hours || '9 AM - 5 PM', 
                fee || 0, hospital_id, qualification || null, rating || 0.0,
                JSON.stringify(availability || { days: [], timeSlots: [] }),
                JSON.stringify(unavailable_dates || []),
                phone || ''
            ]);

            await connection.commit();
            res.status(201).json({ success: true, doctorId: userId });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('[ADMIN API] Error adding doctor:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

module.exports = router;
