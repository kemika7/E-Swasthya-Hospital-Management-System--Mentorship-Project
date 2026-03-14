const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Create a new doctor plan
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });

        const { title, date } = req.body;
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and date are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO doctor_plans (doctor_id, title, date, status) VALUES (?, ?, ?, ?)',
            [req.user.roleId, title, date, 'Pending']
        );

        res.status(201).json({ message: 'Plan created successfully', id: result.insertId, title, date, status: 'Pending' });
    } catch (err) {
        console.error('Error creating plan:', err);
        res.status(500).json({ message: 'Server error creating plan' });
    }
});

// Update plan status
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });

        const { status } = req.body;
        const validStatuses = ['Pending', 'Completed'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Verify ownership
        const [rows] = await db.execute('SELECT doctor_id FROM doctor_plans WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
        if (Number(rows[0].doctor_id) !== Number(req.user.roleId)) {
            return res.status(403).json({ message: 'Access denied to this plan' });
        }

        await db.execute('UPDATE doctor_plans SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Plan status updated successfully' });
    } catch (err) {
        console.error('Error updating plan:', err);
        res.status(500).json({ message: 'Server error updating plan' });
    }
});

// Delete a plan
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });

        // Verify ownership
        const [rows] = await db.execute('SELECT doctor_id FROM doctor_plans WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
        if (Number(rows[0].doctor_id) !== Number(req.user.roleId)) {
            return res.status(403).json({ message: 'Access denied to this plan' });
        }

        await db.execute('DELETE FROM doctor_plans WHERE id = ?', [req.params.id]);
        res.json({ message: 'Plan deleted successfully' });
    } catch (err) {
        console.error('Error deleting plan:', err);
        res.status(500).json({ message: 'Server error deleting plan' });
    }
});

module.exports = router;
