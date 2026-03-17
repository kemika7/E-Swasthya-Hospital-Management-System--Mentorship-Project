const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Authentication middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Forbidden: Patients only' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/health/my-health - Fetch all health records for the logged-in patient
router.get('/my-health', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM patient_health_data WHERE patient_id = ? ORDER BY created_at ASC',
      [req.user.roleId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch health data error:', error);
    res.status(500).json({ message: 'Server error fetching health data' });
  }
});

// GET /api/health/history?from=YYYY-MM-DD&to=YYYY-MM-DD - Fetch history with optional date range
router.get('/history', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql = 'SELECT * FROM patient_health_data WHERE patient_id = ?';
    const params = [req.user.roleId];

    if (from) {
      sql += ' AND DATE(created_at) >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND DATE(created_at) <= ?';
      params.push(to);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Fetch health history error:', error);
    res.status(500).json({ message: 'Server error fetching health history' });
  }
});

// POST /api/health/save - Save a new health record
router.post('/save', auth, async (req, res) => {
  const data = req.body;
  const patient_id = req.user.roleId;

  try {
    const {
      date, age, gender, blood_group, height, weight, bmi, body_fat,
      exercise, exercise_duration, smoking, alcohol, sleep_hours, water_intake,
      chronic_conditions, allergies, past_surgeries, medications,
      blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
      glucose_level, cholesterol_hdl, cholesterol_ldl, spo2, temperature, notes
    } = data;

    // Use provided date or default to today
    const finalDate = date || new Date().toISOString().split('T')[0];

    const sql = `
      INSERT INTO patient_health_data (
        patient_id, created_at, age, gender, blood_group, height, weight, bmi, body_fat,
        exercise, exercise_duration, smoking, alcohol, sleep_hours, water_intake,
        chronic_conditions, allergies, past_surgeries, medications,
        blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
        glucose_level, cholesterol_hdl, cholesterol_ldl, spo2, temperature, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      patient_id, finalDate, age || null, gender || null, blood_group || null, height || null, weight || null, bmi || null, body_fat || null,
      exercise ? 1 : 0, exercise_duration || null, smoking ? 1 : 0, alcohol ? 1 : 0, sleep_hours || null, water_intake || null,
      chronic_conditions || null, allergies || null, past_surgeries || null, medications || null,
      blood_pressure_systolic || null, blood_pressure_diastolic || null, heart_rate || null,
      glucose_level || null, cholesterol_hdl || null, cholesterol_ldl || null, spo2 || null, temperature || null, notes || null
    ];

    await db.execute(sql, params);
    res.json({ success: true, message: 'Health record saved successfully' });
  } catch (error) {
    console.error('Save health data error:', error);
    res.status(500).json({ message: 'Server error saving health data' });
  }
});

module.exports = router;
