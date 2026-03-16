const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all patients (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const [patients] = await db.execute(`
            SELECT DISTINCT p.patient_id as id, p.name, p.email, p.phone, p.age, p.gender, p.address, p.medical_history, p.status, p.profile_pic, p.created_at
            FROM patients p
            JOIN appointments a ON p.patient_id = a.patient_id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE d.hospital_id = ?
        `, [req.user.hospital_id]);
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching patients' });
    }
});

// Create patient (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, email, password, phone, age, gender, address, medical_history, profile_pic } = req.body;

        const [existing] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Patient already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'password123', salt);

        const [result] = await db.execute(
            'INSERT INTO patients (name, email, password, phone, age, gender, address, medical_history, status, profile_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, age, gender, address, medical_history, 'Active', profile_pic || '/images/default-avatar.png']
        );

        res.status(201).json({ message: 'Patient created successfully', patientId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating patient' });
    }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, email, phone, age, gender, address, medical_history, status, profile_pic } = req.body;
        const patientId = req.params.id;

        const [existing] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Patient not found' });

        await db.execute(`
            UPDATE patients 
            SET name = ?, email = ?, phone = ?, age = ?, gender = ?, address = ?, medical_history = ?, status = ?, profile_pic = ?
            WHERE patient_id = ?
        `, [
            name || existing[0].name,
            email || existing[0].email,
            phone || existing[0].phone,
            age || existing[0].age,
            gender || existing[0].gender,
            address || existing[0].address,
            medical_history || existing[0].medical_history,
            status || existing[0].status,
            profile_pic || existing[0].profile_pic,
            patientId
        ]);

        res.json({ message: 'Patient updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating patient' });
    }
});

// Delete patient
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const [p] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
        if (p.length === 0) return res.status(404).json({ message: 'Patient not found' });

        await db.execute('DELETE FROM patients WHERE patient_id = ?', [req.params.id]);
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting patient' });
    }
});

module.exports = router;
