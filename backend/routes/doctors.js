const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all doctors with filtering support
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { category_id, specialty_id } = req.query;
        let query = `
            SELECT d.*, u.name as doctor_name, u.email, u.phone,
                   s.name as specialty_name, c.name as category_name
            FROM doctors d 
            JOIN users u ON d.user_id = u.id
            LEFT JOIN specialties s ON d.specialty_id = s.id
            LEFT JOIN medical_categories c ON s.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (category_id) {
            query += ' AND c.id = ?';
            params.push(category_id);
        }
        if (specialty_id) {
            query += ' AND s.id = ?';
            params.push(specialty_id);
        }

        // Enforce data isolation: if the user has a hospital_id (e.g., admin or doctor),
        // restrict the query to only doctors from that hospital.
        const effectiveHospitalId = req.user?.hospital_id || req.query.hospital_id || req.query.hospitalId;
        
        if (effectiveHospitalId) {
            query += ' AND d.hospital_id = ?';
            params.push(effectiveHospitalId);
        }

        const [doctors] = await db.execute(query, params);
        res.json(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
});

// Get all medical categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM medical_categories WHERE status = "Active"');
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// Get specialties by category
router.get('/specialties/:categoryId', async (req, res) => {
    try {
        const [specialties] = await db.execute('SELECT * FROM specialties WHERE category_id = ? AND status = "Active"', [req.params.categoryId]);
        res.json(specialties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching specialties' });
    }
});

// Get all specialties
router.get('/all-specialties', async (req, res) => {
    try {
        const [specialties] = await db.execute('SELECT * FROM specialties WHERE status = "Active"');
        res.json(specialties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching all specialties' });
    }
});

// ─── Hospital Booking Flow Endpoints ───────────────────────────────

// List all hospitals
router.get('/hospitals', async (req, res) => {
    try {
        const [hospitals] = await db.execute('SELECT * FROM hospitals ORDER BY name');
        res.json(hospitals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching hospitals' });
    }
});

// Get unique specializations for a hospital's doctors
router.get('/hospitals/:hospitalId/specializations', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT DISTINCT d.specialization 
             FROM doctors d 
             WHERE d.hospital_id = ? AND d.specialization IS NOT NULL
             ORDER BY d.specialization`,
            [req.params.hospitalId]
        );
        res.json(rows.map(r => r.specialization));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching specializations' });
    }
});

// Get doctors for a hospital (optionally filtered by specialization)
// ─── Logged-in Doctor Profile & Requests ────────────────────────────

// Get logged in doctor profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [doctor] = await db.execute(`
            SELECT d.*, u.name, u.email, u.role, h.name as hospital_name
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            LEFT JOIN hospitals h ON d.hospital_id = h.id
            WHERE u.id = ?
        `, [userId]);

        if (!doctor || doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor profile not found. Please log in again.' });
        }

        res.json(doctor[0]);
    } catch (err) {
        console.error('[PROFILE FETCH ERROR]', err);
        res.status(500).json({ message: 'Error loading profile data. Please try again later.' });
    }
});

// Update logged in doctor profile (Doctor only)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied. Only doctors can update their own profile.' });

        const userId = req.user.id;
        const { name, specialization, location, dob, blood_group, working_hours } = req.body;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Update name in users table if provided
            if (name) {
                await connection.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
            }

            // Define allowable fields for the doctors table
            let doctorQuery = 'UPDATE doctors SET ';
            let params = [];
            let setClauses = [];

            if (specialization !== undefined) { setClauses.push('specialization = ?'); params.push(specialization); }
            if (location !== undefined) { setClauses.push('location = ?'); params.push(location); }
            if (dob !== undefined) { setClauses.push('dob = ?'); params.push(dob); }
            if (blood_group !== undefined) { setClauses.push('blood_group = ?'); params.push(blood_group); }
            if (working_hours !== undefined) { setClauses.push('working_hours = ?'); params.push(working_hours); }

            if (setClauses.length > 0) {
                doctorQuery += setClauses.join(', ') + ' WHERE user_id = ?';
                params.push(userId);
                await connection.execute(doctorQuery, params);
            }

            await connection.commit();
            res.json({ message: 'Profile updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// Submit a request (Doctor only)
router.post('/requests', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });
        
        const { type, request_data } = req.body;
        const [doctor] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
        if (doctor.length === 0) return res.status(404).json({ message: 'Doctor record not found' });

        await db.execute(
            'INSERT INTO doctor_requests (doctor_id, type, request_data) VALUES (?, ?, ?)',
            [doctor[0].id, type, JSON.stringify(request_data)]
        );

        res.status(201).json({ message: 'Request submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error submitting request' });
    }
});

// Get requests for logged-in doctor
router.get('/requests', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });
        
        const [doctor] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
        if (doctor.length === 0) return res.status(404).json({ message: 'Doctor record not found' });

        const [requests] = await db.execute(
            'SELECT * FROM doctor_requests WHERE doctor_id = ? ORDER BY created_at DESC',
            [doctor[0].id]
        );
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
});

// Admin: Get all requests
router.get('/admin/requests', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        
        const [requests] = await db.execute(`
            SELECT r.*, u.name as doctor_name 
            FROM doctor_requests r
            JOIN doctors d ON r.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE d.hospital_id = ?
            ORDER BY r.status = 'Pending' DESC, r.created_at DESC
        `, [req.user.hospital_id]);
        
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
});

// Admin: Approve/Reject request
router.put('/admin/requests/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        
        const { status, admin_note, adjusted_data } = req.body;
        const requestId = req.params.id;

        const [requestRows] = await db.execute('SELECT * FROM doctor_requests WHERE id = ?', [requestId]);
        if (requestRows.length === 0) return res.status(404).json({ message: 'Request not found' });
        
        const request = requestRows[0];
        const data = adjusted_data || (typeof request.request_data === 'string' ? JSON.parse(request.request_data) : request.request_data);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.execute(
                'UPDATE doctor_requests SET status = ?, admin_note = ? WHERE id = ?',
                [status, admin_note, requestId]
            );

            if (status === 'Approved') {
                if (request.type === 'Leave') {
                    // Fetch current doctor state
                    const [docRows] = await connection.execute('SELECT availability, unavailable_dates FROM doctors WHERE id = ?', [request.doctor_id]);
                    const doc = docRows[0];
                    let currentUnavailable = doc.unavailable_dates ? (typeof doc.unavailable_dates === 'string' ? JSON.parse(doc.unavailable_dates) : doc.unavailable_dates) : [];
                    let currentAvailability = doc.availability ? (typeof doc.availability === 'string' ? JSON.parse(doc.availability) : doc.availability) : { days: [], timeSlots: [], exceptions: {} };
                    if (!currentAvailability.exceptions) currentAvailability.exceptions = {};

                    const leaveDates = data.leaveDates || [];
                    leaveDates.forEach(ld => {
                        if (ld.fullDay) {
                            if (!currentUnavailable.includes(ld.date)) {
                                currentUnavailable.push(ld.date);
                            }
                            if (currentAvailability.exceptions[ld.date]) {
                                delete currentAvailability.exceptions[ld.date];
                            }
                        } else {
                            const globalSlots = currentAvailability.timeSlots || [];
                            const unavailableSlots = ld.slots || [];
                            const availableSlotsForDate = globalSlots.filter(s => !unavailableSlots.includes(s));
                            
                            currentAvailability.exceptions[ld.date] = availableSlotsForDate;
                            currentUnavailable = currentUnavailable.filter(d => d !== ld.date);
                        }
                    });

                    await connection.execute(
                        'UPDATE doctors SET unavailable_dates = ?, availability = ? WHERE id = ?', 
                        [JSON.stringify(currentUnavailable), JSON.stringify(currentAvailability), request.doctor_id]
                    );
                } else if (request.type === 'Schedule') {
                    await connection.execute('UPDATE doctors SET availability = ? WHERE id = ?', [JSON.stringify(data.availability), request.doctor_id]);
                }
            }

            await connection.commit();
            res.json({ message: `Request ${status.toLowerCase()} successfully` });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating request' });
    }
});

// ─── Doctor Parameter Routes ──────────────────────────


// Get specific doctor profile
router.get('/:id', async (req, res) => {
    try {
        const [doctor] = await db.execute(`
            SELECT d.*, u.name as doctor_name, u.email, 
                   s.name as specialty_name, c.name as category_name,
                   h.name as hospital_name
            FROM doctors d 
            JOIN users u ON d.user_id = u.id
            LEFT JOIN specialties s ON d.specialty_id = s.id
            LEFT JOIN medical_categories c ON s.category_id = c.id
            LEFT JOIN hospitals h ON d.hospital_id = h.id
            WHERE d.id = ?
        `, [req.params.id]);

        if (doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(doctor[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching doctor' });
    }
});




// Create doctor (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, email, phone, password, specialty_id: inputSpecialtyId, specialization, experience, bio, location, working_hours, fee, qualification, rating, hospital_id: bodyHospitalId, availability, unavailable_dates } = req.body;
        // Use hospital from body if provided (e.g. for mega-admins), else use admin's own hospital_id
        const hospital_id = bodyHospitalId || req.user.hospital_id;
        const specialty_id = (inputSpecialtyId && inputSpecialtyId !== '') ? inputSpecialtyId : null;

        const cleanEmail = email.trim();
        const cleanPhone = phone ? phone.trim() : '';

        if (!name || !cleanEmail) {
            return res.status(400).json({ message: 'Name and Email are required' });
        }

        // Validate Phone length (10 digits)
        const phoneRegex = /^\\d{10}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        // Format Name: capitalize first letter of each word
        const formattedName = name.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

        // System-wide uniqueness checks
        const [existingUserEmail] = await db.execute('SELECT role FROM users WHERE email = ?', [cleanEmail]);
        const [existingPatientEmail] = await db.execute('SELECT patient_id FROM patients WHERE email = ?', [cleanEmail]);
        
        if (existingUserEmail.length > 0) {
            const role = existingUserEmail[0].role;
            return res.status(400).json({ message: `An account with this email already exists as a ${role}` });
        }
        if (existingPatientEmail.length > 0) {
            return res.status(400).json({ message: 'An account with this email already exists as a patient' });
        }

        if (cleanPhone) {
            const [existingUserPhone] = await db.execute('SELECT role FROM users WHERE phone = ?', [cleanPhone]);
            const [existingPatientPhone] = await db.execute('SELECT patient_id FROM patients WHERE phone = ?', [cleanPhone]);
            
            if (existingUserPhone.length > 0) {
                const role = existingUserPhone[0].role;
                return res.status(400).json({ message: `This phone number is already registered to a ${role}` });
            }
            if (existingPatientPhone.length > 0) {
                return res.status(400).json({ message: 'This phone number is already registered to a patient' });
            }
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        // Default password if not provided
        const finalPassword = password || 'Doctor@123';
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert into users
            const [userResult] = await connection.execute(
                'INSERT INTO users (name, email, phone, password, role, hospital_id, is_verified) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
                [formattedName, cleanEmail, cleanPhone, hashedPassword, 'doctor', hospital_id]
            );
            const userId = userResult.insertId;

            // Insert into doctors
            await connection.execute(`
                INSERT INTO doctors (user_id, specialty_id, specialization, experience, bio, location, working_hours, fee, hospital_id, qualification, rating, availability, unavailable_dates) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId, 
                specialty_id, 
                specialization || null, 
                experience || 0, 
                bio || '', 
                location || 'Kathmandu, Nepal', 
                working_hours || '9 AM - 5 PM', 
                fee || 0, 
                hospital_id,
                qualification || null,
                rating || 0.0,
                JSON.stringify(availability || { days: [], timeSlots: [] }),
                JSON.stringify(unavailable_dates || [])
            ]);

            await connection.commit();
            res.status(201).json({ message: 'Doctor added successfully', doctorId: userId });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('[ADD DOCTOR ERROR]', err);
        res.status(500).json({ message: err.message || 'Server error creating doctor' });
    }
});


// Update doctor
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, specialty_id, specialization, experience, hospital, bio, location, working_hours, fee, qualification, rating, availability, unavailable_dates } = req.body;
        const doctorId = req.params.id;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [d] = await connection.execute('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
            if (d.length === 0) return res.status(404).json({ message: 'Doctor not found' });

            const userId = d[0].user_id;

            // Format name if it is provided
            let finalName = name;
            if (name) {
                finalName = name.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                await connection.execute('UPDATE users SET name = ? WHERE id = ?', [finalName, userId]);
            }

            await connection.execute(`
                UPDATE doctors 
                SET specialty_id = ?, specialization = ?, experience = ?, bio = ?, location = ?, working_hours = ?, fee = ?, qualification = ?, rating = ?, availability = ?, unavailable_dates = ?
                WHERE id = ?
            `, [
                specialty_id, 
                specialization, 
                experience, 
                bio, 
                location, 
                working_hours, 
                fee, 
                qualification, 
                rating, 
                JSON.stringify(availability), 
                JSON.stringify(unavailable_dates), 
                doctorId
            ]);

            await connection.commit();
            res.json({ message: 'Doctor updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating doctor' });
    }
});

// Delete doctor
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const [d] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [req.params.id]);
        if (d.length === 0) return res.status(404).json({ message: 'Doctor not found' });

        await db.execute('DELETE FROM users WHERE id = ?', [d[0].user_id]);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting doctor' });
    }
});

// Update doctor schedule (Admin only)
router.put('/:id/schedule', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        
        const { availability, unavailable_dates } = req.body;
        const doctorId = req.params.id;

        await db.execute(
            'UPDATE doctors SET availability = ?, unavailable_dates = ? WHERE id = ?',
            [JSON.stringify(availability), JSON.stringify(unavailable_dates), doctorId]
        );

        res.json({ message: 'Schedule updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating schedule' });
    }
});

// Get doctor availability for a specific date
router.get('/:id/availability', async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        const doctorId = req.params.id;

        if (!date) return res.status(400).json({ message: 'Date is required' });

        const [doctors] = await db.execute('SELECT availability, unavailable_dates FROM doctors WHERE id = ?', [doctorId]);
        if (doctors.length === 0) return res.status(404).json({ message: 'Doctor not found' });

        const { availability, unavailable_dates } = doctors[0];
        const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
        const parsedUnavailable = typeof unavailable_dates === 'string' ? JSON.parse(unavailable_dates) : unavailable_dates;

        // 1. Check if date is in unavailable_dates
        if (parsedUnavailable && parsedUnavailable.includes(date)) {
            return res.json({ available: false, message: 'Doctor is unavailable on this date', slots: [], allDaySlots: [] });
        }

        // 2. Check for date-specific exceptions (overrides)
        let masterSlots = null;
        if (parsedAvailability && parsedAvailability.exceptions && parsedAvailability.exceptions[date]) {
            masterSlots = parsedAvailability.exceptions[date];
        }

        // 3. If no exception, check if the weekday is available and set masterSlots from recurring schedule
        if (masterSlots === null) {
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));
            if (!parsedAvailability || !parsedAvailability.days || !parsedAvailability.days.includes(dayName)) {
                return res.json({ available: false, message: `Doctor is not scheduled for ${dayName}s`, slots: [], allDaySlots: [] });
            }
            masterSlots = parsedAvailability.timeSlots || [];
        }

        // 4. Fetch existing appointments for this doctor on this date to filter slots
        const [appointments] = await db.execute(
            'SELECT time FROM appointments WHERE doctor_id = ? AND date = ? AND status != "Cancelled"',
            [doctorId, date]
        );
        const bookedTimes = appointments.map(a => a.time.substring(0, 5));

        // 5. Filter masterSlots based on existing bookings and current time (if today)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const isToday = (date === todayStr);

        const availableSlots = masterSlots.filter(slot => {
            const startTime = slot.split('-')[0].trim(); // e.g. "09:00"
            
            // Filter by existing bookings
            if (bookedTimes.includes(startTime)) return false;

            // Filter by current time (if today)
            if (isToday) {
                const [h, m] = startTime.split(':');
                const slotDate = new Date();
                slotDate.setHours(parseInt(h), parseInt(m), 0);
                // Allow slots at least 15 mins in the future
                if (slotDate.getTime() < now.getTime() + (15 * 60000)) return false;
            }

            return true;
        });

        res.json({ 
            available: true, 
            slots: availableSlots,
            allDaySlots: masterSlots || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching availability' });
    }
});


module.exports = router;

