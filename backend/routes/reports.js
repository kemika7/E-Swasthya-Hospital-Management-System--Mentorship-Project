const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// ─── Multer: storage for uploaded reports ────────────────────────────────────
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
// PDF-only file filter
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// ════════════════════════════════════════════════════════════════════════════
// NEW PATIENT REPORTS FEATURE
// ════════════════════════════════════════════════════════════════════════════

// POST /api/reports/upload-report  → Patient uploads a PDF report
router.post('/upload-report', authenticateToken, authorizeRoles('patient'), upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file is not a valid PDF.' });
    }

    const patientId = req.user.roleId;
    const fileName = req.file.originalname;
    const filePath = '/uploads/reports/' + path.basename(req.file.path);

    const [result] = await db.execute(
      'INSERT INTO patient_reports (patient_id, file_name, file_path) VALUES (?, ?, ?)',
      [patientId, fileName, filePath]
    );

    res.status(201).json({
      message: 'Report uploaded successfully',
      report: {
        id: result.insertId,
        file_name: fileName,
        file_path: filePath,
        uploaded_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Upload patient report error:', error);
    res.status(500).json({ message: 'Server error uploading report' });
  }
});

// Multer error handler for this router
router.use((err, req, res, next) => {
  if (err && err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: 'Only PDF files are allowed. Please upload a valid PDF.' });
  }
  next(err);
});

// GET /api/reports/my-patient-reports  → Patient fetches their own reports
router.get('/my-patient-reports', authenticateToken, authorizeRoles('patient'), async (req, res) => {
  try {
    const patientId = req.user.roleId;
    const [rows] = await db.execute(
      'SELECT * FROM patient_reports WHERE patient_id = ? ORDER BY uploaded_at DESC',
      [patientId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch my patient reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// GET /api/reports/patient-reports/:patientId  → Doctor fetches a patient's reports
router.get('/patient-reports/:patientId', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const doctorId = req.user.roleId;
    const { patientId } = req.params;

    // Access control: doctor must have at least one appointment with this patient
    const [assigned] = await db.execute(
      'SELECT 1 FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1',
      [doctorId, patientId]
    );

    if (assigned.length === 0) {
      return res.status(403).json({ message: 'Access denied: Patient is not assigned to you.' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM patient_reports WHERE patient_id = ? ORDER BY uploaded_at DESC',
      [patientId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fetch patient reports (doctor) error:', error);
    res.status(500).json({ message: 'Server error fetching patient reports' });
  }
});

// GET /api/reports/my-patients  → Doctor fetches their assigned patients (for dropdown)
router.get('/my-patients', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const doctorId = req.user.roleId;
    const [rows] = await db.execute(
      `SELECT DISTINCT p.patient_id as id, p.name, p.email
       FROM patients p
       JOIN appointments a ON p.patient_id = a.patient_id
       WHERE a.doctor_id = ?
       ORDER BY p.name ASC`,
      [doctorId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fetch my-patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// EXISTING ADMIN REPORT ROUTES (unchanged)
// ════════════════════════════════════════════════════════════════════════════

// 1. GET /api/reports/my-report - Get report status for logged-in patient
router.get('/my-report', authenticateToken, async (req, res) => {
  try {
    const patientRoleId = req.user.roleId; // For patients, roleId is the patient_id
    if (!patientRoleId) {
        return res.status(400).json({ message: 'Patient ID missing in session.' });
    }

    const [rows] = await db.execute('SELECT * FROM reports WHERE patient_id = ? ORDER BY uploaded_at DESC LIMIT 1', [patientRoleId]);
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
    console.error('[REPORTS MY-REPORT ERROR]', error);
    res.status(500).json({ message: 'Server error fetching report status' });
  }
});

// 2. GET /api/reports - Get all reports (Admin)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const [rows] = await db.execute(`
      SELECT r.*, p.name as patient_name 
      FROM reports r 
      JOIN patients p ON r.patient_id = p.patient_id
      LEFT JOIN appointments a ON r.patient_id = a.patient_id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE d.hospital_id = ?
      ORDER BY r.uploaded_at DESC
    `, [hospitalId]);
    res.json(rows);
  } catch (error) {
    console.error('[REPORTS GET ALL ERROR]', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// 3. PUT /api/reports/:id - Update report status (Admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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
      consultation_status || 'pending', consultation_percent || 0,
      record_updated_status || 'pending', record_updated_percent || 0,
      report_generated_status || 'pending', report_generated_percent || 0,
      report_published_status || 'pending', report_published_percent || 0,
      overall_progress || 0, req.params.id
    ]);
    res.json({ message: 'Report updated successfully' });
  } catch (error) {
    console.error('[REPORTS UPDATE ERROR]', error);
    res.status(500).json({ message: 'Server error updating report' });
  }
});

// 4. POST /api/reports/create/:patientId - Create new report entry (Admin)
router.post('/create/:patientId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const [result] = await db.execute('INSERT INTO reports (patient_id) VALUES (?)', [req.params.patientId]);
        res.status(201).json({ message: 'Report entry created', id: result.insertId });
    } catch (err) {
        console.error('[REPORTS CREATE ERROR]', err);
        res.status(500).json({ message: 'Server error creating report entry' });
    }
});

// 5. POST /api/reports/upload/:id - Upload final report file (Admin)
router.post('/upload/:id', authenticateToken, authorizeRoles('admin'), upload.single('report'), async (req, res) => {
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
    console.error('[REPORTS UPLOAD ERROR]', error);
    res.status(500).json({ message: 'Server error uploading report' });
  }
});

// 6. GET /api/reports/my-patient-reports - Get all reports for the logged-in patient
router.get('/my-patient-reports', authenticateToken, async (req, res) => {
  try {
    const patientRoleId = req.user.roleId;
    if (!patientRoleId) {
      return res.status(400).json({ message: 'Patient ID missing in session.' });
    }

    const [rows] = await db.execute('SELECT * FROM patient_reports WHERE patient_id = ? ORDER BY uploaded_at DESC', [patientRoleId]);
    res.json(rows);
  } catch (error) {
    console.error('[REPORTS MY-PATIENT-REPORTS ERROR]', error);
    res.status(500).json({ message: 'Server error fetching patient reports' });
  }
});

// 7. POST /api/reports/upload-report - Upload report by patient
router.post('/upload-report', authenticateToken, upload.single('report'), async (req, res) => {
  try {
    const patientRoleId = req.user.roleId;
    if (!patientRoleId) {
      return res.status(400).json({ message: 'Patient ID missing in session.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = req.file.originalname;
    const filePath = '/uploads/reports/' + path.basename(req.file.path);

    await db.execute(
      'INSERT INTO patient_reports (patient_id, file_name, file_path) VALUES (?, ?, ?)',
      [patientRoleId, fileName, filePath]
    );

    res.status(201).json({ 
      message: 'Report uploaded successfully', 
      filePath,
      file_name: fileName
    });
  } catch (error) {
    console.error('[REPORTS PATIENT UPLOAD ERROR]', error);
    res.status(500).json({ message: 'Server error uploading report' });
  }
});

module.exports = router;
