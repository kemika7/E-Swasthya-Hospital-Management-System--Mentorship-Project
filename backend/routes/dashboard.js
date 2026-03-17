const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get patient dashboard stats
router.get('/patient', authenticateToken, async (req, res) => {
    try {
        const patientId = req.user.roleId;
        if (!patientId) return res.status(400).json({ message: 'Patient profile not found' });

        // Upcoming appointment
        const [upcoming] = await db.execute(`
      SELECT a.appointment_id as id, a.patient_id, a.doctor_id, a.date, a.time, a.duration, a.status, a.appointment_type as type, a.notes, a.created_at, u.name as doctorName, d.specialization as specialty 

      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = ? AND a.date >= CURDATE() AND a.status = 'Scheduled'
      ORDER BY a.date ASC, a.time ASC
      LIMIT 1
    `, [patientId]);

        // Categories from the real medical_categories table
        const [categories] = await db.execute('SELECT id, name FROM medical_categories WHERE status = "Active" LIMIT 12');

        res.json({
            upcomingAppointment: upcoming[0] || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error fetching dashboard data' });
    }
});

// Get medical categories (all active ones, regardless of hospital/doctors)
router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const [categories] = await db.execute(
            'SELECT id, name, description FROM medical_categories WHERE status = "Active" ORDER BY name ASC LIMIT 20'
        );
        res.json(categories.map(c => ({ id: c.id, name: c.name, description: c.description })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error fetching categories' });
    }
});


// Get doctor dashboard stats
router.get('/doctor', authenticateToken, async (req, res) => {
    try {
        const doctorId = req.user.roleId;
        const hospitalId = req.user.hospital_id || 0;
        if (!doctorId) return res.status(400).json({ message: 'Doctor profile not found' });

        // Statistics
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN date = CURDATE() THEN 1 ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END), 0) as pending

            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.doctor_id = ? AND a.status != 'Cancelled' AND d.hospital_id = ?
        `, [doctorId, hospitalId]);

        const statsRow = (stats && stats[0]) ? stats[0] : { total: 0, today: 0, pending: 0 };

        // Scheduled events summary (Real data based on appointment types)
        const [events] = await db.execute(`
            SELECT 
                appointment_type as label, COUNT(*) as count
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.doctor_id = ? AND a.status = 'Scheduled' AND d.hospital_id = ?
            GROUP BY appointment_type
        `, [doctorId, hospitalId]);

        // Today's activities
        const [activities] = await db.execute(`
            SELECT a.appointment_id, a.time, p.name as title, a.status

            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.doctor_id = ? AND a.date = CURDATE() AND a.status != 'Cancelled' AND d.hospital_id = ?
            ORDER BY a.time ASC
        `, [doctorId, hospitalId]);

        // Upcoming appointments
        const [upcoming] = await db.execute(`
            SELECT a.appointment_id as id, a.patient_id, a.doctor_id, a.date, a.time, a.duration, a.status, a.appointment_type as type, a.notes, a.created_at, p.name as patientName

            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.doctor_id = ? AND (a.date > CURDATE() OR (a.date = CURDATE() AND a.time >= CURTIME()))
            AND a.status = 'Scheduled' AND d.hospital_id = ?
            ORDER BY a.date ASC, a.time ASC
        `, [doctorId, hospitalId]);

        // Dates with appointments for calendar highlights
        const [indicatorRows] = await db.execute(`
            SELECT DISTINCT date
            FROM appointments
            WHERE doctor_id = ? AND status = 'Scheduled'
        `, [doctorId]);
        const appointmentDates = indicatorRows.map(r => {
            if (r.date instanceof Date) {
               return r.date.toISOString().split('T')[0];
            }
            return r.date;
        });

        // Today's custom plans
        const [doctorPlans] = await db.execute(`
            SELECT id, title, description, status, date

            FROM doctor_plans
            WHERE doctor_id = ? AND date = CURDATE()
            ORDER BY created_at ASC
        `, [doctorId]);

        res.json({
            stats: {
                offline: statsRow.total || 0,
                online: statsRow.pending || 0,
                laboratory: 0
            },
            scheduledEvents: {
                labels: (events || []).map(e => e.label),
                values: (events || []).map(e => e.count)
            },
            todayCount: statsRow.today || 0,
            activities: (activities || []).map(a => ({
                id: a.appointment_id,
                time: a.time,
                title: `Consultation: ${a.title}`,
                status: a.status
            })),
            upcomingAppointments: (upcoming || []).map(u => ({
                id: u.id,
                date: u.date,
                time: u.time,
                type: u.type,
                patientName: u.patientName,
                notes: u.notes
            })),
            appointmentDates,
            doctorPlans: (doctorPlans || []).map(p => ({
                id: p.id,
                title: p.title,
                status: p.status,
                description: p.description

            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error fetching doctor dashboard' });
    }
});

// Get admin dashboard stats
router.get('/admin', authenticateToken, async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id || 0;

        // Basic Counts (Filtered by hospital_id where applicable)
        const [counts] = await db.execute(`
            SELECT 
                (SELECT COUNT(DISTINCT a.patient_id) FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE d.hospital_id = ?) as totalPatients,
                (SELECT COUNT(*) FROM doctors WHERE hospital_id = ?) as totalDoctors,
                (SELECT COUNT(*) FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE a.date = CURDATE() AND d.hospital_id = ?) as totalAppointmentsToday,
                (SELECT COUNT(*) FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE d.hospital_id = ?) as totalTransactions,
                (SELECT IFNULL(SUM(a.fee), 0) FROM (SELECT app.doctor_id, doc.fee FROM appointments app JOIN doctors doc ON app.doctor_id = doc.id WHERE app.status = 'Completed' AND doc.hospital_id = ?) as a) as totalRevenue
        `, [hospitalId, hospitalId, hospitalId, hospitalId, hospitalId]);

        // Top Performing Doctors
        const [topDoctors] = await db.execute(`
            SELECT d.*, u.name, u.email 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE d.hospital_id = ?
            ORDER BY d.rating DESC 
            LIMIT 5
        `, [hospitalId]);

        // Recent Appointments
        const [recentAppointments] = await db.execute(`
            SELECT a.appointment_id as id, a.patient_id, a.doctor_id, a.date, a.time, a.duration, a.status, a.appointment_type as type, a.notes, a.created_at, p.name as patientName, ud.name as doctorName

            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users ud ON d.user_id = ud.id
            WHERE d.hospital_id = ?
            ORDER BY a.date DESC
            LIMIT 10
        `, [hospitalId]);


        // Latest Announcements
        const [announcements] = await db.execute(`
            SELECT * FROM announcements 
            WHERE hospital_id = ? OR hospital_id IS NULL 
            ORDER BY date DESC, created_at DESC LIMIT 5
        `, [hospitalId]);

        // Patient Mix / Analytics (Filtered by those who have visited THIS hospital)
        const [analytics] = await db.execute(`
            SELECT 
                DATE_FORMAT(a.date, '%b') as month,
                COUNT(DISTINCT a.patient_id) as count
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE d.hospital_id = ? AND a.date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month, MONTH(a.date)
            ORDER BY MONTH(a.date)
        `, [hospitalId]);

        res.json({
            kpis: counts[0],
            topDoctors: topDoctors.map(d => ({
                id: d.id,
                name: d.name,
                specialty: d.specialization,
                rating: d.rating || 0
            })),
            analytics: {
                labels: analytics.map(a => a.month),
                data: analytics.map(a => a.count)
            },
            appointments: recentAppointments.map(a => ({
                id: a.id,

                patientName: a.patientName,
                doctorName: a.doctorName,
                date: a.date,
                time: a.time,
                type: a.appointment_type,
                status: a.status
            })),
            announcements: announcements.map(a => ({
                id: a.id,
                title: a.title,
                body: a.body,
                date: (a.date && typeof a.date.toISOString === 'function') ? a.date.toISOString().split('T')[0] : a.date
            })),
            beds: {
                general: { total: 50, occupied: 32 },
                icu: { total: 10, occupied: 4 },
                private: { total: 20, occupied: 15 },
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error fetching admin dashboard' });
    }
});

module.exports = router;
