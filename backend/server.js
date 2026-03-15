const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/reports', express.static(path.join(__dirname, 'uploads/reports')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: '*', // Allow all for debugging, can refine later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/locker', require('./routes/locker'));
app.use('/api/reports', require('./routes/reports'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database Connection Test
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    res.json({ status: 'OK', message: 'Database connection successful', result: rows[0].result });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: 'Database connection failed', error: error.message });
  }
});

// Auto-patch: ensure patients table has is_verified column
async function ensurePatientSchema() {
  try {
    const [columns] = await db.execute('DESCRIBE patients');
    const colNames = columns.map(c => c.Field);
    if (!colNames.includes('is_verified')) {
      await db.execute('ALTER TABLE patients ADD COLUMN is_verified BOOLEAN DEFAULT FALSE');
      console.log('[DB] Added missing is_verified column to patients table.');
    }
    if (!colNames.includes('mpin')) {
      await db.execute('ALTER TABLE patients ADD COLUMN mpin VARCHAR(255) NULL');
      console.log('[DB] Added missing mpin column to patients table.');
    }
    
    // Create patient_documents table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS patient_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] patient_documents table ready.');

    // Create reports table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        consultation_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        consultation_percent INT DEFAULT 0,
        record_updated_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        record_updated_percent INT DEFAULT 0,
        report_generated_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        report_generated_percent INT DEFAULT 0,
        report_published_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        report_published_percent INT DEFAULT 0,
        overall_progress INT DEFAULT 0,
        report_file_path VARCHAR(255) NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] reports table ready.');
    
  } catch (err) {
    // patients table may not exist yet - that's okay
    console.warn('[DB] Could not patch patients schema:', err.message);
  }
}

// Auto-patch: ensure hospitals table exists and doctors have hospital_id
async function ensureHospitalSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        type ENUM('Government','Private','Teaching') DEFAULT 'Private',
        phone VARCHAR(30),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] hospitals table ready.');
  } catch (err) {
    console.warn('[DB] Could not create hospitals table:', err.message);
  }
  try {
    const [cols] = await db.execute('DESCRIBE doctors');
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes('hospital_id')) {
      await db.execute('ALTER TABLE doctors ADD COLUMN hospital_id INT NULL');
      console.log('[DB] Added hospital_id column to doctors table.');
    }
  } catch (err) {
    console.warn('[DB] Could not patch doctors schema:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await ensurePatientSchema();
  await ensureHospitalSchema();
});
// Nodemon re-trigger
