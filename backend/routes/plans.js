const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all plans for logged in doctor
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });
        const doctorId = req.user.roleId;

        const [plans] = await db.execute(
            'SELECT * FROM doctor_plans WHERE doctor_id = ? ORDER BY date DESC, created_at DESC',
            [doctorId]
        );
        res.json(plans);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new plan
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });
        const doctorId = req.user.roleId;
        const { title, date } = req.body;

        if (!title || !date) return res.status(400).json({ message: 'Title and date are required' });

        const [result] = await db.execute(
            'INSERT INTO doctor_plans (doctor_id, title, date, status) VALUES (?, ?, ?, ?)',
            [doctorId, title, date, 'Pending']
        );

        res.status(201).json({ id: result.insertId, title, date, status: 'Pending' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update plan status
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });
        const doctorId = req.user.roleId;
        const { status } = req.body;

        const [result] = await db.execute(
            'UPDATE doctor_plans SET status = ? WHERE id = ? AND doctor_id = ?',
            [status, req.params.id, doctorId]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Plan not found' });

        res.json({ message: 'Plan updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a plan
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });
        const doctorId = req.user.roleId;

        const [result] = await db.execute(
            'DELETE FROM doctor_plans WHERE id = ? AND doctor_id = ?',
            [req.params.id, doctorId]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Plan not found' });

        res.json({ message: 'Plan deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
