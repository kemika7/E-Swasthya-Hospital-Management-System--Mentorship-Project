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

// POST /api/health/save - Save a new health record
router.post('/save', auth, async (req, res) => {
  const data = req.body;
  const patient_id = req.user.roleId;

  try {
    // Extract fields from nested frontend object if necessary, or assume flattened
    // The implementation plan suggested refining Reports.jsx to send flat data
    
    const {
      age, gender, blood_group, height, weight, bmi,
      exercise, exercise_duration, smoking, alcohol, sleep_hours, water_intake,
      chronic_conditions, allergies, past_surgeries, medications,
      blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
      glucose_level, cholesterol_hdl, cholesterol_ldl, spo2, temperature, notes,
      date
    } = data;

    let sql, params;
    if (date) {
      sql = `
        INSERT INTO patient_health_data (
          patient_id, age, gender, blood_group, height, weight, bmi,
          exercise, exercise_duration, smoking, alcohol, sleep_hours, water_intake,
          chronic_conditions, allergies, past_surgeries, medications,
          blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
          glucose_level, cholesterol_hdl, cholesterol_ldl, spo2, temperature, notes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        patient_id, age, gender, blood_group, height, weight, bmi,
        exercise ? 1 : 0, exercise_duration, smoking ? 1 : 0, alcohol ? 1 : 0, sleep_hours, water_intake,
        chronic_conditions, allergies, past_surgeries, medications,
        blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
        glucose_level, cholesterol_hdl, cholesterol_ldl, spo2, temperature, notes,
        date
      ];
    } else {
      sql = `
        INSERT INTO patient_health_data (
          patient_id, age, gender, blood_group, height, weight, bmi,
          exercise, exercise_duration, smoking, alcohol, sleep_hours, water_intake,
          chronic_conditions, allergies, past_surgeries, medications,
          blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
          glucose_level, cholesterol_hdl, cholesterol_ldl, spo2, temperature, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        patient_id, age, gender, blood_group, height, weight, bmi,
        exercise ? 1 : 0, exercise_duration, smoking ? 1 : 0, alcohol ? 1 : 0, sleep_hours, water_intake,
        chronic_conditions, allergies, past_surgeries, medications,
        blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
        glucose_level, cholesterol_hdl, cholesterol_ldl, spo2, temperature, notes
      ];
    }

    await db.execute(sql, params);
    res.json({ success: true, message: 'Health record saved successfully' });
  } catch (error) {
    console.error('Save health data error:', error);
    res.status(500).json({ message: 'Server error saving health data' });
  }
});

module.exports = router;
