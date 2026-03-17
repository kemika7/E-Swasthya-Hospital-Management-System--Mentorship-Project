const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Add new health data entry
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { date, weight, blood_pressure_sys, blood_pressure_dia, sugar_level, heart_rate, notes } = req.body;
        let patient_id;

        if (req.user.role === 'patient') {
            patient_id = req.user.roleId;
        } else {
            return res.status(403).json({ message: 'Only patients can add health data' });
        }

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const [result] = await db.execute(
            'INSERT INTO patient_health_data (patient_id, date, weight, blood_pressure_sys, blood_pressure_dia, sugar_level, heart_rate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [patient_id, date, weight || null, blood_pressure_sys || null, blood_pressure_dia || null, sugar_level || null, heart_rate || null, notes || null]
        );

        res.status(201).json({ message: 'Health data saved successfully', id: result.insertId });
    } catch (err) {
        console.error('Error saving health data:', err);
        res.status(500).json({ message: 'Server error saving health data' });
    }
});

// Fetch all health records for a patient
router.get('/', authenticateToken, async (req, res) => {
    try {
        let patient_id;

        if (req.user.role === 'patient') {
            patient_id = req.user.roleId;
        } else if (req.user.role === 'doctor') {
            // Doctors might need to see patient health data, but we'll focus on patient for now
            // For now, only patients can see their own data
            return res.status(403).json({ message: 'Access denied' });
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [rows] = await db.execute(
            'SELECT * FROM patient_health_data WHERE patient_id = ? ORDER BY date DESC, created_at DESC',
            [patient_id]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching health data:', err);
        res.status(500).json({ message: 'Server error fetching health data' });
    }
});

// Delete health data entry
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const patient_id = req.user.roleId;

        if (req.user.role !== 'patient') {
            return res.status(403).json({ message: 'Only patients can delete their health data' });
        }

        const [result] = await db.execute(
            'DELETE FROM patient_health_data WHERE id = ? AND patient_id = ?',
            [id, patient_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        console.error('Error deleting health data:', err);
        res.status(500).json({ message: 'Server error deleting health data' });
    }
});

module.exports = router;
