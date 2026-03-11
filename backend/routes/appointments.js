const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get appointments for logged in user (patient or doctor)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let query = '';
        let params = [];

        if (req.user.role === 'patient') {
            query = `
        SELECT a.appointment_id as id, a.patient_id, a.doctor_id, a.date, a.time, a.duration, a.status, a.appointment_type as type, a.notes, a.created_at, u.name as doctorName, d.specialization as specialty 
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE a.patient_id = ?
        ORDER BY a.date DESC, a.time DESC
      `;
            params = [req.user.roleId];
        } else if (req.user.role === 'doctor') {
            const dateFilter = req.query.date;
            query = `
        SELECT a.appointment_id as id, a.patient_id, a.doctor_id, a.date, a.time, a.duration, a.status, a.appointment_type as type, a.notes, a.created_at, p.name as patientName 
        FROM appointments a
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = ?
      `;
            params = [req.user.roleId];

            if (dateFilter) {
                query += ' AND a.date = ?';
                params.push(dateFilter);
            }

            query += ' ORDER BY a.date DESC, a.time DESC';
        }

        const [appointments] = await db.execute(query, params);
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching appointments' });
    }
});

// Create an appointment (Patient or Admin)
router.post('/', authenticateToken, async (req, res) => {
    let { doctorId, patientId, date, time, duration, appointment_type, notes } = req.body;

    // If patient books, use their ID. If admin books, use provided patientId.
    if (req.user.role === 'patient') {
        patientId = req.user.roleId;
    } else if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    if (!patientId || !doctorId) {
        return res.status(400).json({ message: 'Patient ID and Doctor ID are required' });
    }

    if (!date || !time) {
        return res.status(400).json({ message: 'Date and time are required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO appointments (patient_id, doctor_id, date, time, duration, status, appointment_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [patientId, doctorId, date, time, duration || 30, 'Scheduled', appointment_type || 'Consultation', notes || null]
        );
        res.status(201).json({ message: 'Appointment created successfully', appointmentId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error booking appointment' });
    }
});

// Get all appointments (Admin only)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const [appointments] = await db.execute(`
            SELECT a.appointment_id as id, a.patient_id, a.doctor_id, a.date, a.time, a.duration, a.status, a.appointment_type as type, a.notes, a.created_at, p.name as patientName, ud.name as doctorName
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users ud ON d.user_id = ud.id
            ORDER BY a.date DESC, a.time DESC
        `);
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching all appointments' });
    }
});

// Update appointment status, date, time, notes (Admin/Doctor)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { status, date, time, duration, appointment_type, notes } = req.body;
        const id = req.params.id;

        if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        let query = 'UPDATE appointments SET ';
        let params = [];
        let setClauses = [];

        if (status) { setClauses.push('status = ?'); params.push(status); }
        if (date) { setClauses.push('date = ?'); params.push(date); }
        if (time) { setClauses.push('time = ?'); params.push(time); }
        if (duration !== undefined) { setClauses.push('duration = ?'); params.push(duration); }
        if (appointment_type) { setClauses.push('appointment_type = ?'); params.push(appointment_type); }
        if (notes !== undefined) { setClauses.push('notes = ?'); params.push(notes); }

        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        query += setClauses.join(', ') + ' WHERE appointment_id = ?';
        params.push(id);

        await db.execute(query, params);
        res.json({ message: 'Appointment updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating appointment' });
    }
});

// Admin deletes appointment
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        await db.execute('DELETE FROM appointments WHERE appointment_id = ?', [req.params.id]);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting appointment' });
    }
});

module.exports = router;
