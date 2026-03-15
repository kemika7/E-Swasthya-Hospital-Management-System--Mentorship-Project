const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use the same database configuration as the main app
const db = require('./config/db');

const dummyDoctors = [
  // Cardiology
  { name: 'Dr. Raj Sharma', email: 'raj.sharma@hospital.com', specialization: 'Cardiology', hospital: 'Heart Center Hospital', phone: '9841000001' },
  { name: 'Dr. Anita KC', email: 'anita.kc@hospital.com', specialization: 'Cardiology', hospital: 'Metro Hospital', phone: '9841000002' },
  { name: 'Dr. Sunil Thapa', email: 'sunil.thapa@hospital.com', specialization: 'Cardiology', hospital: 'National Heart Institute', phone: '9841000003' },
  
  // General Physician
  { name: 'Dr. Sita Gurung', email: 'sita.gurung@hospital.com', specialization: 'General Physician', hospital: 'City General Hospital', phone: '9841000004' },
  { name: 'Dr. Mohan Rai', email: 'mohan.rai@hospital.com', specialization: 'General Physician', hospital: 'Community Health Center', phone: '9841000005' },
  { name: 'Dr. Ramesh Shrestha', email: 'ramesh.shrestha@hospital.com', specialization: 'General Physician', hospital: 'Central Medical Center', phone: '9841000006' },
  
  // Orthopedics
  { name: 'Dr. Pawan Khadka', email: 'pawan.khadka@hospital.com', specialization: 'Orthopedics', hospital: 'Bone and Joint Hospital', phone: '9841000007' },
  { name: 'Dr. Rekha Tamang', email: 'rekha.tamang@hospital.com', specialization: 'Orthopedics', hospital: 'Orthopedic Care Center', phone: '9841000008' },
  { name: 'Dr. Kiran Joshi', email: 'kiran.joshi@hospital.com', specialization: 'Orthopedics', hospital: 'Sports Medicine Institute', phone: '9841000009' },
  
  // Gastroenterology
  { name: 'Dr. Sunita Maharjan', email: 'sunita.maharjan@hospital.com', specialization: 'Gastroenterology', hospital: 'Digestive Health Center', phone: '9841000010' },
  { name: 'Dr. Nabin Thapa', email: 'nabin.thapa@hospital.com', specialization: 'Gastroenterology', hospital: 'Gastro Clinic', phone: '9841000011' },
  { name: 'Dr. Anju Rai', email: 'anju.rai@hospital.com', specialization: 'Gastroenterology', hospital: 'Liver and Gut Institute', phone: '9841000012' },
  
  // Dermatology
  { name: 'Dr. Priya Koirala', email: 'priya.koirala@hospital.com', specialization: 'Dermatology', hospital: 'Skin Care Center', phone: '9841000013' },
  { name: 'Dr. Ashok Gurung', email: 'ashok.gurung@hospital.com', specialization: 'Dermatology', hospital: 'Dermatology Clinic', phone: '9841000014' },
  { name: 'Dr. Namrata Shrestha', email: 'namrata.shrestha@hospital.com', specialization: 'Dermatology', hospital: 'Beauty and Skin Hospital', phone: '9841000015' }
];

async function seedDoctors() {
  let connection;
  
  try {
    connection = await db.getConnection();
    console.log('Connected to database');

    // Start transaction
    await connection.beginTransaction();

    for (const doctor of dummyDoctors) {
      try {
        // Check if user already exists
        const [existingUsers] = await connection.execute(
          'SELECT * FROM users WHERE email = ?', 
          [doctor.email]
        );
        
        if (existingUsers.length > 0) {
          console.log(`User ${doctor.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Insert into users table
        const [userResult] = await connection.execute(
          'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, TRUE)',
          [doctor.name, doctor.email, hashedPassword, 'doctor']
        );
        const userId = userResult.insertId;

        // Find specialty ID
        const [specialty] = await connection.execute(
          'SELECT id FROM specialties WHERE name = ? OR name LIKE ?',
          [doctor.specialization, `%${doctor.specialization}%`]
        );
        
        const specialtyId = specialty.length > 0 ? specialty[0].id : null;

        // Insert into doctors table
        await connection.execute(
          'INSERT INTO doctors (user_id, specialty_id, specialization, hospital, location, phone) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, specialtyId, doctor.specialization, doctor.hospital, 'Kathmandu, Nepal', doctor.phone]
        );

        console.log(`Added doctor: ${doctor.name}`);
      } catch (error) {
        console.error(`Error adding doctor ${doctor.name}:`, error.message);
      }
    }

    // Commit transaction
    await connection.commit();
    console.log('Successfully added all dummy doctors!');

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error seeding doctors:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the seed function
seedDoctors();
