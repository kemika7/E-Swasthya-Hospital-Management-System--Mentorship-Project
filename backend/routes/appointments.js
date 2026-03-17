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
    console.log('Backend [POST /appointments]: Booking attempt by user:', JSON.stringify(req.user));
    let { doctorId, patientId, hospitalId, date, time, duration, appointment_type, notes } = req.body;

    // If patient books, use their ID. If admin books, use provided patientId.
    if (req.user.role === 'patient') {
        patientId = req.user.roleId;
    } else if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    // Ensure IDs are numbers
    const finalPatientId = Number(patientId);
    const finalDoctorId = Number(doctorId);
    const finalHospitalId = hospitalId ? Number(hospitalId) : null;

    console.log(`Backend [POST /appointments]: Final Params -> patientId: ${finalPatientId}, doctorId: ${finalDoctorId}, hospitalId: ${finalHospitalId}, date: ${date}, time: ${time}`);

    if (!finalPatientId || !finalDoctorId) {
        return res.status(400).json({ message: 'Valid Patient ID and Doctor ID are required' });
    }

    if (!date || !time) {
        return res.status(400).json({ message: 'Date and time are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);

        // 1. Future Booking Limit (2 Weeks Rule)
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 14);

        if (bookingDate < today) {
            await connection.rollback();
            return res.status(400).json({ message: 'Selected date is in the past' });
        }
        if (bookingDate > maxDate) {
            await connection.rollback();
            return res.status(400).json({ message: 'Appointments can only be booked within the next 2 weeks' });
        }

        // 2. Real-Time Time Validation for Today
        if (bookingDate.getTime() === today.getTime()) {
            const now = new Date();
            const [hours, minutes] = time.split(':');
            const slotDate = new Date();
            slotDate.setHours(parseInt(hours), parseInt(minutes), 0);
            
            // Allow booking only if the slot is at least 15 mins in the future
            if (slotDate.getTime() < now.getTime() + (15 * 60000)) {
                await connection.rollback();
                return res.status(400).json({ message: 'Selected time has already passed or is too soon' });
            }
        }

        // 3. One Appointment Per Day Per Doctor
        const [duplicate] = await connection.execute(
            'SELECT appointment_id FROM appointments WHERE patient_id = ? AND doctor_id = ? AND date = ? AND status != "Cancelled"',
            [finalPatientId, finalDoctorId, date]
        );
        if (duplicate.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'You already have an appointment today with this doctor. You can only book one appointment per day.' });
        }

        // --- Availability Check ---
        const [doctorRows] = await connection.execute('SELECT availability, unavailable_dates FROM doctors WHERE id = ?', [finalDoctorId]);
        if (doctorRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const { availability, unavailable_dates } = doctorRows[0];
        const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
        const parsedUnavailable = typeof unavailable_dates === 'string' ? JSON.parse(unavailable_dates) : unavailable_dates;

        // 1. Check if date is blocked
        if (parsedUnavailable && parsedUnavailable.includes(date)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Doctor is unavailable on this date' });
        }

        // 2. Check if weekday is scheduled
        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));
        if (!parsedAvailability || !parsedAvailability.days || !parsedAvailability.days.includes(dayName)) {
            await connection.rollback();
            return res.status(400).json({ message: `Doctor is not scheduled for ${dayName}s` });
        }

        // 3. Check if slot is in availability
        const slotTime = time.substring(0, 5); // 09:00:00 -> 09:00
        const isValidSlot = (parsedAvailability.timeSlots || []).some(slot => slot.startsWith(slotTime));
        if (!isValidSlot) {
            await connection.rollback();
            return res.status(400).json({ message: 'Requested time slot is not in doctor\'s schedule' });
        }

        // 4. Check if slot is already booked (WITH LOCK)
        const [existing] = await connection.execute(
            'SELECT appointment_id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != "Cancelled" FOR UPDATE',
            [finalDoctorId, date, time]
        );
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'This time slot is already booked. Please choose another slot.' });
        }
        // --- End Availability Check ---

        console.log('Backend [POST /appointments]: Inserting into DB:', {
            patient_id: finalPatientId,
            doctor_id: finalDoctorId,
            hospital_id: finalHospitalId,
            date,
            time,
            appointment_type: appointment_type || 'Consultation'
        });
        const [result] = await connection.execute(
            'INSERT INTO appointments (patient_id, doctor_id, hospital_id, date, time, duration, status, appointment_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [finalPatientId, finalDoctorId, finalHospitalId, date, time, duration || 30, 'Scheduled', appointment_type || 'Consultation', notes || null]
        );

        await connection.commit();
        console.log('Backend [POST /appointments]: Insert successful, ID:', result.insertId);
        res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertId });
    } catch (err) {
        await connection.rollback();
        console.error('Backend [POST /appointments]: MySQL Error:', err);
        res.status(500).json({ message: 'Server error booking appointment: ' + err.message });
    } finally {
        connection.release();
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
            WHERE d.hospital_id = ?
            ORDER BY a.date DESC, a.time DESC
        `, [req.user.hospital_id]);
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching all appointments' });
    }
});

// Update appointment status (Admin/Doctor/Patient for cancellation)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { status, date, time, duration, appointment_type, notes } = req.body;
        const id = req.params.id;

        console.log(`Backend: Update attempt for appointment ${id} by user:`, req.user);

        // Fetch the appointment first to check ownership
        const [rows] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
        if (rows.length === 0) {
            console.log(`Backend: Appointment ${id} not found`);
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const appointment = rows[0];
        console.log(`Backend: Found appointment:`, appointment);

        // Permission check:
        // Admin can update anything.
        // Doctor can update if it's their appointment.
        // Patient can ONLY cancel if it's their appointment.
        if (req.user.role === 'patient') {
            if (Number(appointment.patient_id) !== Number(req.user.roleId)) {
                console.log(`Backend: Access denied. appointment.patient_id (${appointment.patient_id}) !== req.user.roleId (${req.user.roleId})`);
                return res.status(403).json({ message: 'Access denied: You can only update your own appointments' });
            }
            // Patients can only change status to 'Cancelled'
            if (status !== 'Cancelled' || (Object.keys(req.body).length > 1 && (date || time || duration || appointment_type || notes))) {
                console.log(`Backend: Access denied. Patient tried to update more than status=Cancelled`);
                return res.status(403).json({ message: 'Access denied: Patients can only cancel their appointments' });
            }
        } else if (req.user.role === 'doctor') {
            if (Number(appointment.doctor_id) !== Number(req.user.roleId)) {
                return res.status(403).json({ message: 'Access denied: You can only update appointments assigned to you' });
            }
        }
        else if (req.user.role !== 'admin') {
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
        if (date && req.user.role !== 'patient') { setClauses.push('date = ?'); params.push(date); }
        if (time && req.user.role !== 'patient') { setClauses.push('time = ?'); params.push(time); }
        if (duration !== undefined && req.user.role !== 'patient') { setClauses.push('duration = ?'); params.push(duration); }
        if (appointment_type && req.user.role !== 'patient') { setClauses.push('appointment_type = ?'); params.push(appointment_type); }
        if (notes !== undefined && req.user.role !== 'patient') { setClauses.push('notes = ?'); params.push(notes); }

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
