const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/doctor/:id/appointments
router.get('/:id/appointments', authenticateToken, async (req, res) => {
    try {
        const doctorId = req.params.id;
        
        // Safety check: Ensure the logged-in doctor is only fetching their own appointments
        // unless they are an admin.
        if (req.user.role === 'doctor' && Number(req.user.roleId) !== Number(doctorId)) {
            return res.status(403).json({ message: 'Access denied: You can only view your own appointments' });
        }

        const query = `
            SELECT 
                a.appointment_id as id,
                a.date,
                a.time as start_time,
                a.duration,
                a.status,
                a.appointment_type as type,
                a.notes,
                p.name as patient_name,
                a.doctor_id
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ? AND a.status = 'Scheduled'
            ORDER BY a.date ASC, a.time ASC
        `;
        
        const [appointments] = await db.execute(query, [doctorId]);
        
        // Calculate end_time for each appointment
        const refinedAppointments = (appointments || []).map(a => {
            if (!a.start_time) {
                return { ...a, end_time: '00:00:00' };
            }
            
            try {
                const [hours, minutes] = a.start_time.split(':');
                const startDate = new Date();
                startDate.setHours(parseInt(hours || 0, 10), parseInt(minutes || 0, 10), 0);
                
                const duration = a.duration || 30;
                const endDate = new Date(startDate.getTime() + (duration * 60000));
                const endHours = String(endDate.getHours()).padStart(2, '0');
                const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
                
                return {
                    id: a.id,
                    date: a.date,
                    time: a.start_time,
                    start_time: a.start_time,
                    end_time: `${endHours}:${endMinutes}:00`,
                    patient_name: a.patient_name || 'Patient',
                    status: a.status || 'Scheduled',
                    type: a.type || 'Consultation',
                    notes: a.notes || '',
                    doctor_id: a.doctor_id,
                    duration: duration
                };
            } catch (e) {
                console.error(`Error parsing time for appointment ${a.id}:`, e);
                return { ...a, end_time: a.start_time };
            }
        });

        res.json(refinedAppointments);
    } catch (err) {
        console.error('Error fetching doctor appointments:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
