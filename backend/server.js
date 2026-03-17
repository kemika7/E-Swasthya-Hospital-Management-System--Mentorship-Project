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
app.use('/api/doctor', require('./routes/doctorAppointments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/locker', require('./routes/locker'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/health', require('./routes/health'));
app.use('/api/admin', require('./routes/admin'));

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
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
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
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
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
    if (!colNames.includes('qualification')) {
      await db.execute('ALTER TABLE doctors ADD COLUMN qualification VARCHAR(255) NULL');
      console.log('[DB] Added qualification column to doctors table.');
    }
    if (!colNames.includes('phone')) {
      await db.execute('ALTER TABLE doctors ADD COLUMN phone VARCHAR(20) NULL');
      console.log('[DB] Added phone column to doctors table.');
    }
    if (!colNames.includes('availability')) {
      await db.execute('ALTER TABLE doctors ADD COLUMN availability LONGTEXT NULL');
      console.log('[DB] Added availability column to doctors table.');
    }
    if (!colNames.includes('unavailable_dates')) {
      await db.execute('ALTER TABLE doctors ADD COLUMN unavailable_dates LONGTEXT NULL');
      console.log('[DB] Added unavailable_dates column to doctors table.');
    }
  } catch (err) {
    console.warn('[DB] Could not patch doctors schema:', err.message);
  }
}

// Auto-patch: ensure announcements table exists
async function ensureAnnouncementSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hospital_id INT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (hospital_id)
      )
    `);
    console.log('[DB] announcements table ready.');

    const [cols] = await db.execute('DESCRIBE announcements');
    if (!cols.map(c => c.Field).includes('hospital_id')) {
      await db.execute('ALTER TABLE announcements ADD COLUMN hospital_id INT NULL, ADD INDEX (hospital_id)');
      console.log('[DB] Added hospital_id to announcements table.');
    }

    const [rows] = await db.execute('SELECT COUNT(*) as count FROM announcements');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO announcements (title, body, date) VALUES 
        ('Welcome to Admin Dashboard', 'You can now manage doctors, patients and appointments from here.', CURDATE()),
        ('System Update', 'New reporting features have been added to the doctor dashboard.', CURDATE())
      `);
      console.log('[DB] Seeded initial announcements.');
    }
  } catch (err) {
    console.warn('[DB] Could not create announcements table:', err.message);
  }
}

// Auto-patch: ensure patient_health_data table exists
async function ensureHealthSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS patient_health_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        age INT,
        gender VARCHAR(10),
        blood_group VARCHAR(10),
        height FLOAT,
        weight FLOAT,
        bmi FLOAT,
        body_fat FLOAT,
        exercise BOOLEAN,
        exercise_duration INT,
        smoking BOOLEAN,
        alcohol BOOLEAN,
        sleep_hours FLOAT,
        water_intake FLOAT,
        chronic_conditions TEXT,
        allergies TEXT,
        past_surgeries TEXT,
        medications TEXT,
        blood_pressure_systolic INT,
        blood_pressure_diastolic INT,
        heart_rate INT,
        glucose_level FLOAT,
        cholesterol_hdl FLOAT,
        cholesterol_ldl FLOAT,
        spo2 FLOAT,
        temperature FLOAT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
      )
    `);
    // Add body_fat column if missing (for existing tables)
    try {
      const [cols] = await db.execute('DESCRIBE patient_health_data');
      if (!cols.map(c => c.Field).includes('body_fat')) {
        await db.execute('ALTER TABLE patient_health_data ADD COLUMN body_fat FLOAT NULL AFTER bmi');
        console.log('[DB] Added body_fat column to patient_health_data.');
      }
    } catch (_) {}
    console.log('[DB] patient_health_data table ready.');
  } catch (err) {
    console.warn('[DB] Could not create patient_health_data table:', err.message);
  }
}

// Auto-patch: ensure doctor_plans table exists
async function ensureDoctorPlansSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS doctor_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status ENUM('Pending', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] doctor_plans table ready.');
  } catch (err) {
    console.warn('[DB] Could not create doctor_plans table:', err.message);
  }
}

// Auto-patch: ensure patient_reports table exists
async function ensurePatientReportsSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS patient_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(512) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] patient_reports table ready.');
  } catch (err) {
    console.warn('[DB] Could not create patient_reports table:', err.message);
  }
}
// Auto-patch: ensure document_locker table exists
async function ensureLockerSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS document_locker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        mpin_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS patient_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] document_locker and patient_documents tables ready.');
  } catch (err) {
    console.warn('[DB] Could not create locker tables:', err.message);
  }
}

// Auto-patch: ensure doctor_requests table exists
async function ensureRequestSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS doctor_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        type ENUM('Leave', 'Schedule') NOT NULL,
        request_data LONGTEXT NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (doctor_id),
        INDEX (status)
      )
    `);
    console.log('[DB] doctor_requests table ready.');
  } catch (err) {
    console.warn('[DB] Could not create doctor_requests table:', err.message);
  }
}

// Auto-patch: ensure doctor_plans table exists
async function ensurePlansSchema() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS doctor_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        date DATE NOT NULL,
        status ENUM('Pending', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (doctor_id),
        INDEX (date)
      )
    `);
    const [cols] = await db.execute('DESCRIBE doctor_plans');
    if (!cols.map(c => c.Field).includes('description')) {
      await db.execute('ALTER TABLE doctor_plans ADD COLUMN description TEXT NULL AFTER title');
      console.log('[DB] Added description column to doctor_plans table.');
    }
    console.log('[DB] doctor_plans table ready.');
  } catch (err) {
    console.warn('[DB] Could not create doctor_plans table:', err.message);
  }
}
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Run schema patches sequentially to avoid exhausting free DB connection limit
  const patches = [
    ensurePatientSchema,
    ensureHospitalSchema,
    ensureAnnouncementSchema,
    ensureHealthSchema,
    ensureLockerSchema,
    ensureDoctorPlansSchema,
    ensurePatientReportsSchema,
    ensureRequestSchema,
    ensurePlansSchema,
  ];
  for (const patch of patches) {
    try { await patch(); } catch (e) { console.warn('[PATCH]', e.message); }
    // small pause between patches so connections are released
    await new Promise(r => setTimeout(r, 300));
  }
});
