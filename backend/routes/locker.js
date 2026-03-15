const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to mock/extract patient_id
// (In a real app, use auth middleware. Here we assume patientId is sent in headers or body,
// or we simulate using the patient auth logic)
const extractPatientId = (req, res, next) => {
  // For this prototype, usually we have the patientId passed from the frontend
  // E.g., via Authorization header (JWT)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    if (decoded.role !== 'patient') {
      return res.status(403).json({ message: 'Forbidden: Patients only' });
    }
    req.patientId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// 1. GET /status - Check if patient has MPIN
router.get('/status', extractPatientId, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT mpin FROM patients WHERE id = ?', [req.patientId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Patient not found' });
    
    const hasPin = rows[0].mpin !== null && rows[0].mpin !== '';
    res.json({ hasSetPin: hasPin });
  } catch (error) {
    console.error('Locker status error:', error);
    res.status(500).json({ message: 'Server error check locker status' });
  }
});

// 2. POST /setup-pin
router.post('/setup-pin', extractPatientId, async (req, res) => {
  try {
    const { mpin } = req.body;
    if (!mpin || mpin.length !== 4) return res.status(400).json({ message: 'MPIN must be 4 digits' });

    const hashedPin = await bcrypt.hash(mpin, 10);
    await db.execute('UPDATE patients SET mpin = ? WHERE id = ?', [hashedPin, req.patientId]);
    
    res.json({ message: 'MPIN setup successfully' });
  } catch (error) {
    console.error('Locker setup pin error:', error);
    res.status(500).json({ message: 'Server error setting up pin' });
  }
});

// 3. POST /verify-pin
router.post('/verify-pin', extractPatientId, async (req, res) => {
  try {
    const { mpin } = req.body;
    if (!mpin) return res.status(400).json({ message: 'MPIN is required' });

    const [rows] = await db.execute('SELECT mpin FROM patients WHERE id = ?', [req.patientId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Patient not found' });

    const storedHash = rows[0].mpin;
    if (!storedHash) return res.status(400).json({ message: 'MPIN not set up yet' });

    const isMatch = await bcrypt.compare(mpin, storedHash);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect PIN' });

    res.json({ message: 'PIN verified' });
  } catch (error) {
    console.error('Locker verify pin error:', error);
    res.status(500).json({ message: 'Server error verifying pin' });
  }
});

// 4. GET /documents
router.get('/documents', extractPatientId, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, file_path, file_type, size, uploaded_at FROM patient_documents WHERE patient_id = ? ORDER BY uploaded_at DESC', [req.patientId]);
    
    const documents = rows.map(r => ({
      id: r.id,
      name: r.name,
      file_path: '/uploads/' + path.basename(r.file_path), // Expose path relative to static dir
      file_type: r.file_type,
      size: (r.size / 1024 / 1024).toFixed(2) + ' MB',
      uploadedOn: new Date(r.uploaded_at).toISOString().split('T')[0]
    }));

    res.json({ documents });
  } catch (error) {
    console.error('Get docs error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
});

// 5. POST /upload
router.post('/upload', extractPatientId, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, path: filePath, mimetype, size } = req.file;
    
    const [result] = await db.execute(
      'INSERT INTO patient_documents (patient_id, name, file_path, file_type, size) VALUES (?, ?, ?, ?, ?)',
      [req.patientId, originalname, filePath, mimetype, size]
    );

    const newDoc = {
      id: result.insertId,
      name: originalname,
      file_path: '/uploads/' + path.basename(filePath),
      file_type: mimetype,
      size: (size / 1024 / 1024).toFixed(2) + ' MB',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.status(201).json({ message: 'Document uploaded successfully', document: newDoc });
  } catch (error) {
    console.error('Upload doc error:', error);
    res.status(500).json({ message: 'Server error uploading document' });
  }
});

// 6. DELETE /documents/:id
router.delete('/documents/:id', extractPatientId, async (req, res) => {
  try {
    const docId = req.params.id;
    
    // Check if doc exists and belongs to patient
    const [rows] = await db.execute('SELECT file_path FROM patient_documents WHERE id = ? AND patient_id = ?', [docId, req.patientId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = rows[0].file_path;
    
    // Delete from DB
    await db.execute('DELETE FROM patient_documents WHERE id = ?', [docId]);

    // Delete file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete doc error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
});

module.exports = router;
