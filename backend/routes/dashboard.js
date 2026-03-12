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
      SELECT a.*, u.name as doctorName, d.specialization as specialty 
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
            categories: categories.map((c) => ({ id: c.id, name: c.name, icon: 'FiActivity' }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

// Get doctor dashboard stats
router.get('/doctor', authenticateToken, async (req, res) => {
    try {
        const doctorId = req.user.roleId;
        if (!doctorId) return res.status(400).json({ message: 'Doctor profile not found' });

        // Statistics
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                IFNULL(SUM(CASE WHEN date = CURDATE() THEN 1 ELSE 0 END), 0) as today,
                IFNULL(SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END), 0) as pending
            FROM appointments 
            WHERE doctor_id = ? AND status != 'Cancelled'
        `, [doctorId]);

        // Scheduled events summary (Real data based on appointment types)
        const [events] = await db.execute(`
            SELECT 
                appointment_type as label, COUNT(*) as count
            FROM appointments 
            WHERE doctor_id = ? AND status = 'Scheduled'
            GROUP BY appointment_type
        `, [doctorId]);

        // Today's activities
        const [activities] = await db.execute(`
            SELECT a.time, p.name as title
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ? AND a.date = CURDATE() AND a.status != 'Cancelled'
            ORDER BY a.time ASC
        `, [doctorId]);

        // Upcoming appointments
        const [upcoming] = await db.execute(`
            SELECT a.appointment_id as id, a.date, a.time, a.status, a.appointment_type, p.name as patientName
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ? 
            AND (a.date > CURDATE() OR (a.date = CURDATE() AND a.time >= SUBTIME(CURTIME(), '00:30:00')))
            AND a.status = 'Scheduled'
            ORDER BY a.date ASC, a.time ASC
            LIMIT 20
        `, [doctorId]);

        // Personal plans
        const [plans] = await db.execute(`
            SELECT * FROM doctor_plans 
            WHERE doctor_id = ? AND date = CURDATE()
            ORDER BY created_at DESC
        `, [doctorId]);

        res.json({
            stats: {
                offline: stats[0].total,
                online: stats[0].pending
            },
            scheduledEvents: {
                labels: events.map(e => e.label),
                values: events.map(e => e.count)
            },
            todayCount: stats[0].today,
            activities: activities.map(a => ({
                time: a.time,
                title: `Consultation: ${a.title}`
            })),
            upcomingAppointments: upcoming.map(u => ({
                id: u.id,
                date: u.date,
                time: u.time,
                type: u.appointment_type,
                patientName: u.patientName
            })),
            plans: plans.map(p => ({
                id: p.id,
                title: p.title,
                status: p.status
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching doctor dashboard' });
    }
});

// Get admin dashboard stats
router.get('/admin', authenticateToken, async (req, res) => {
    try {
        // Basic Counts
        const [counts] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM patients) as totalPatients,
                (SELECT COUNT(*) FROM doctors) as totalDoctors,
                (SELECT COUNT(*) FROM appointments WHERE date = CURDATE()) as totalAppointmentsToday,
                (SELECT COUNT(*) FROM appointments) as totalTransactions,
                (SELECT IFNULL(SUM(fee), 0) FROM doctors JOIN appointments ON doctors.id = appointments.doctor_id WHERE appointments.status = 'Completed') as totalRevenue
        `);

        // Top Performing Doctors
        const [topDoctors] = await db.execute(`
            SELECT d.*, u.name, u.email 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            ORDER BY d.rating DESC 
            LIMIT 5
        `);

        // Recent Appointments
        const [recentAppointments] = await db.execute(`
            SELECT a.*, p.name as patientName, ud.name as doctorName
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users ud ON d.user_id = ud.id
            ORDER BY a.date DESC
            LIMIT 10
        `);

        // Latest Announcements
        const [announcements] = await db.execute(`
            SELECT * FROM announcements ORDER BY date DESC, created_at DESC LIMIT 5
        `);

        // Patient Mix / Analytics (Real data: Counts by month)
        const [analytics] = await db.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%b') as month,
                COUNT(*) as count
            FROM patients
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month, MONTH(created_at)
            ORDER BY MONTH(created_at)
        `);

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
                id: a.appointment_id,
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
                date: a.date.toISOString().split('T')[0]
            })),
            beds: {
                general: { total: 50, occupied: 32 },
                icu: { total: 10, occupied: 4 },
                private: { total: 20, occupied: 15 },
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching admin dashboard' });
    }
});

module.exports = router;
