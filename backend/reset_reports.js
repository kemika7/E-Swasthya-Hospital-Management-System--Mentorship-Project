const db = require('./config/db');
require('dotenv').config();

async function resetReportsTable() {
  try {
    console.log('Dropping old reports table...');
    await db.execute('DROP TABLE IF EXISTS reports');
    
    console.log('Creating new reports table with tracking fields...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        overall_progress INT DEFAULT 0,
        consultation_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        consultation_percent INT DEFAULT 0,
        record_updated_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        record_updated_percent INT DEFAULT 0,
        report_generated_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        report_generated_percent INT DEFAULT 0,
        report_published_status ENUM('pending', 'in_progress', 'done') DEFAULT 'pending',
        report_published_percent INT DEFAULT 0,
        report_file_path VARCHAR(255),
        hospital_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
      )
    `);
    
    console.log('Reports table reset successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting reports table:', err);
    process.exit(1);
  }
}

resetReportsTable();
