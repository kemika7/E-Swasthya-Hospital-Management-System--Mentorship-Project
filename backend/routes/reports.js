const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for uploaded reports
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Authentication middleware (simplified)
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin only' });
  }
};

// 1. GET /api/reports/my-report - Get report status for logged-in patient
router.get('/my-report', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM reports WHERE patient_id = ? ORDER BY uploaded_at DESC LIMIT 1', [req.user.id]);
    if (rows.length === 0) {
      return res.json({
        consultation_status: 'pending',
        consultation_percent: 0,
        record_updated_status: 'pending',
        record_updated_percent: 0,
        report_generated_status: 'pending',
        report_generated_percent: 0,
        report_published_status: 'pending',
        report_published_percent: 0,
        overall_progress: 0,
        report_file_path: null
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Fetch my-report error:', error);
    res.status(500).json({ message: 'Server error fetching report status' });
  }
});

// 2. GET /api/reports - Get all reports (Admin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT r.*, p.name as patient_name 
      FROM reports r 
      JOIN patients p ON r.patient_id = p.id
      ORDER BY r.uploaded_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Fetch all reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// 3. PUT /api/reports/:id - Update report status (Admin)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { 
    consultation_status, consultation_percent,
    record_updated_status, record_updated_percent,
    report_generated_status, report_generated_percent,
    report_published_status, report_published_percent,
    overall_progress
  } = req.body;

  try {
    await db.execute(`
      UPDATE reports SET 
        consultation_status = ?, consultation_percent = ?,
        record_updated_status = ?, record_updated_percent = ?,
        report_generated_status = ?, report_generated_percent = ?,
        report_published_status = ?, report_published_percent = ?,
        overall_progress = ?
      WHERE id = ?
    `, [
      consultation_status, consultation_percent,
      record_updated_status, record_updated_percent,
      report_generated_status, report_generated_percent,
      report_published_status, report_published_percent,
      overall_progress, req.params.id
    ]);
    res.json({ message: 'Report updated successfully' });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error updating report' });
  }
});

// 4. POST /api/reports/create/:patientId - Create new report entry (Admin)
router.post('/create/:patientId', auth, isAdmin, async (req, res) => {
    try {
        const [result] = await db.execute('INSERT INTO reports (patient_id) VALUES (?)', [req.params.patientId]);
        res.status(201).json({ message: 'Report entry created', id: result.insertId });
    } catch (err) {
        console.error('Create report entry error:', err);
        res.status(500).json({ message: 'Server error creating report entry' });
    }
});

// 5. POST /api/reports/upload/:id - Upload final report file (Admin)
router.post('/upload/:id', auth, isAdmin, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = '/uploads/reports/' + path.basename(req.file.path);
    
    await db.execute('UPDATE reports SET report_file_path = ?, report_published_status = "done", report_published_percent = 100, overall_progress = 100 WHERE id = ?', [
      filePath, req.params.id
    ]);

    res.json({ message: 'Report file uploaded successfully', filePath });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ message: 'Server error uploading report' });
  }
});

module.exports = router;
