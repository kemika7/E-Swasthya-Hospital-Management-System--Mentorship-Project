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
        if (req.user && req.user.hospital_id) {
            query += ' AND d.hospital_id = ?';
            params.push(req.user.hospital_id);
        } else if (req.query.hospital_id) {
            // Fallback for public/patient queries if they provide a filter
            query += ' AND d.hospital_id = ?';
            params.push(req.query.hospital_id);
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
router.get('/hospitals/:hospitalId/doctors', async (req, res) => {
    try {
        const { specialization } = req.query;
        let query = `
            SELECT d.*, u.name as doctor_name, u.email,
                   s.name as specialty_name
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            LEFT JOIN specialties s ON d.specialty_id = s.id
            WHERE d.hospital_id = ?
        `;
        const params = [req.params.hospitalId];

        if (specialization) {
            query += ' AND d.specialization = ?';
            params.push(specialization);
        }

        query += ' ORDER BY u.name';
        const [doctors] = await db.execute(query, params);
        res.json(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching hospital doctors' });
    }
});

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

        if (doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        res.json(doctor[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});



// Create doctor (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, email, phone, password, specialty_id: inputSpecialtyId, specialization, experience, bio, location, working_hours, fee, qualification, rating } = req.body;
        // Strictly use the admin's hospital_id
        const hospital_id = req.user.hospital_id;
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
                INSERT INTO doctors (user_id, specialty_id, specialization, experience, bio, location, working_hours, fee, hospital_id, qualification, rating) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                rating || 0.0
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

// Update doctor
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { name, specialty_id, specialization, experience, hospital, bio, location, working_hours, fee, qualification, rating } = req.body;
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
                SET specialty_id = ?, specialization = ?, experience = ?, bio = ?, location = ?, working_hours = ?, fee = ?, qualification = ?, rating = ?
                WHERE id = ?
            `, [specialty_id, specialization, experience, bio, location, working_hours, fee, qualification, rating, doctorId]);

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

module.exports = router;
