const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const [announcements] = await db.execute('SELECT * FROM announcements ORDER BY date DESC, created_at DESC');
        res.json(announcements);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching announcements' });
    }
});

// Create announcement (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { title, body, date } = req.body;
        await db.execute(
            'INSERT INTO announcements (title, body, date) VALUES (?, ?, ?)',
            [title, body, date || new Date().toISOString().split('T')[0]]
        );
        res.status(201).json({ message: 'Announcement created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating announcement' });
    }
});

// Delete announcement (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        await db.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting announcement' });
    }
});

module.exports = router;
