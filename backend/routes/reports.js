const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { extractTextFromPDF } = require('../utils/pdfExtractor');
const { analyzeMedicalReport } = require('../services/openaiService');


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
// PATIENT REPORTS FEATURE
// ════════════════════════════════════════════════════════════════════════════

// POST /api/reports/upload-report  → Patient uploads a PDF report
router.post('/upload-report', authenticateToken, authorizeRoles('patient', 'admin'), upload.single('report'), async (req, res) => {
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

// GET /api/reports/my-patient-reports  → Patient fetches their own reports
router.get('/my-patient-reports', authenticateToken, authorizeRoles('patient', 'admin'), async (req, res) => {
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

// GET /api/reports/my-patients  → Doctor fetches their assigned patients
router.get('/my-patients', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user.roleId;
    
    // A doctor's patients are those who have appointments with them
    const [rows] = await db.execute(`
      SELECT DISTINCT p.patient_id as id, p.name, p.email, p.phone, p.gender, p.age
      FROM patients p
      JOIN appointments a ON p.patient_id = a.patient_id
      WHERE a.doctor_id = ?
    `, [doctorId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Fetch my patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
});

// GET /api/reports/patient-reports/:patientId  → Doctor fetches a patient's reports
router.get('/patient-reports/:patientId', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
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

// ════════════════════════════════════════════════════════════════════════════
// AI ANALYSIS ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════

// POST /api/reports/analyze  → Dedicated endpoint for OpenAI report analysis (Patient-facing)
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    let { reportText, reportId } = req.body;
    let images = [];
    
    // If reportId is provided, fetch file and extract content
    if (reportId && !reportText) {
      const [rows] = await db.execute('SELECT file_path FROM patient_reports WHERE id = ?', [reportId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Report not found' });
      }
      const filePath = path.join(__dirname, '..', rows[0].file_path);
      
      // Proactive file existence check
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          message: 'Physical report file not found on server.', 
          error: 'The PDF file associated with this report ID is missing. It may have been removed during a recent system revert. Please re-upload the report.' 
        });
      }

      const extracted = await extractTextFromPDF(filePath);
      reportText = extracted.text;
      images = extracted.images;
    }

    if (!reportText && (!images || images.length === 0)) {
      return res.status(400).json({ message: 'Report content could not be extracted.' });
    }

    console.log(`[AI Analysis] Calling OpenAI. Text length: ${reportText.length}, Images: ${images.length}`);

    // Call OpenAI Service (Vision Fallback is handled inside openaiService)
    const result = await analyzeMedicalReport(reportText, images, null, req.user.role || 'patient');

    // Persist to DB for consistency if reportId exists
    if (reportId) {
      await db.execute(
        'UPDATE patient_reports SET gpt_analysis = ? WHERE id = ?',
        [JSON.stringify(result), reportId]
      );
    }

    res.json({
      message: 'Analysis completed successfully',
      analysis: result
    });

  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ message: "Analysis failed", error: error.message });
  }
});

// POST /api/reports/analyze-report  → Unified Doctor/Admin analysis endpoint
router.post('/analyze-report', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const { reportId } = req.body;
    if (!reportId) return res.status(400).json({ message: 'Report ID is required.' });

    const [reports] = await db.execute('SELECT * FROM patient_reports WHERE id = ?', [reportId]);
    if (reports.length === 0) return res.status(404).json({ message: 'Report not found.' });

    const report = reports[0];
    const filePath = path.join(__dirname, '..', report.file_path);
    
    // Proactive file existence check
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: 'Physical report file not found on server.', 
        error: 'The PDF file associated with this report ID is missing. Please ask the patient to re-upload it.' 
      });
    }

    // Extract with Vision fallback
    const { text, images } = await extractTextFromPDF(filePath);
    
    console.log(`[AI Analysis] Extracted text=${text.length}, images=${images.length}. Calling AI...`);

    // Analyze with AI
    const analysis = await analyzeMedicalReport(text, images, null, req.user.role);

    // Save to DB
    await db.execute(
      'UPDATE patient_reports SET gpt_analysis = ? WHERE id = ?',
      [JSON.stringify(analysis), reportId]
    );

    res.json({
      message: 'Analysis completed successfully',
      analysis
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ message: 'Server error during AI analysis', error: error.message });
  }
});

// GET /api/reports/analysis/:reportId  → Fetch stored analysis result
router.get('/analysis/:reportId', authenticateToken, authorizeRoles('doctor', 'patient', 'admin'), async (req, res) => {
  try {
    const { reportId } = req.params;
    const [rows] = await db.execute(
      'SELECT gpt_analysis, extracted_data FROM patient_reports WHERE id = ?',
      [reportId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Report not found' });
    
    let analysis = rows[0].gpt_analysis;
    if (typeof analysis === 'string') analysis = JSON.parse(analysis);
    
    res.json(analysis || {});
  } catch (error) {
    console.error('Fetch analysis error:', error);
    res.status(500).json({ message: 'Server error fetching analysis' });
  }
});

module.exports = router;
