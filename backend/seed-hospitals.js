const db = require('./config/db');
const bcrypt = require('bcryptjs');

const hospitals = [
  { name: 'Shahid Gangalal National Heart Centre', location: 'Bansbari, Kathmandu', type: 'Government', phone: '01-4371322', description: 'Nepal\'s premier cardiac hospital specializing in heart diseases and cardiac surgery.' },
  { name: 'Civil Service Hospital', location: 'Minbhawan, Kathmandu', type: 'Government', phone: '01-4232891', description: 'Multi-specialty government hospital serving civil servants and general public.' },
  { name: 'Bir Hospital', location: 'Mahaboudha, Kathmandu', type: 'Government', phone: '01-4221119', description: 'Nepal\'s oldest government hospital with comprehensive medical services.' },
  { name: 'Norvic International Hospital', location: 'Thapathali, Kathmandu', type: 'Private', phone: '01-4258554', description: 'Premium private hospital with state-of-the-art facilities and specialist care.' },
  { name: 'Patan Hospital', location: 'Lagankhel, Lalitpur', type: 'Government', phone: '01-5522266', description: 'Major referral hospital in Lalitpur offering wide range of specialty services.' },
  { name: 'Tribhuvan University Teaching Hospital', location: 'Maharajgunj, Kathmandu', type: 'Teaching', phone: '01-4412404', description: 'Premier teaching hospital affiliated with Institute of Medicine, TU.' },
  { name: 'Grande International Hospital', location: 'Dhapasi, Kathmandu', type: 'Private', phone: '01-5159266', description: 'Modern multi-specialty hospital with advanced diagnostic and treatment facilities.' },
  { name: 'Vayodha Hospital', location: 'Balkhu, Kathmandu', type: 'Private', phone: '01-4270101', description: 'Specialized hospital for elderly care with comprehensive geriatric services.' },
  { name: 'Om Hospital & Research Centre', location: 'Chabahil, Kathmandu', type: 'Private', phone: '01-4460894', description: 'Research-oriented hospital with expert teams across multiple specialties.' },
  { name: 'Kanti Children\'s Hospital', location: 'Maharajgunj, Kathmandu', type: 'Government', phone: '01-4412773', description: 'Nepal\'s national pediatric hospital providing specialized children\'s healthcare.' },
  { name: 'National Academy of Medical Sciences', location: 'Bir Hospital Road, Kathmandu', type: 'Teaching', phone: '01-4221986', description: 'National autonomous body for postgraduate medical education and research.' },
  { name: 'Sukraraj Tropical and Infectious Disease Hospital', location: 'Teku, Kathmandu', type: 'Government', phone: '01-4255897', description: 'Specialist hospital for tropical, infectious and communicable diseases.' },
  { name: 'Nepal Medical College Teaching Hospital', location: 'Jorpati, Kathmandu', type: 'Teaching', phone: '01-4911008', description: 'Teaching hospital with advanced facilities for medical education and patient care.' },
  { name: 'B&B Hospital', location: 'Gwarko, Lalitpur', type: 'Private', phone: '01-5202280', description: 'Modern multi-specialty hospital with expert medical professionals.' },
  { name: 'National Hospital and Cancer Research Centre', location: 'New Baneshwor, Kathmandu', type: 'Government', phone: '01-4780600', description: 'National cancer treatment and research centre providing oncology services.' },
];

const specializations = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
  'Gynecology', 'Ophthalmology', 'ENT', 'Gastroenterology', 'Pulmonology'
];

const doctorFirstNames = [
  'Rajesh', 'Sanjay', 'Priya', 'Anita', 'Bikash',
  'Sunita', 'Rohan', 'Nirmala', 'Deepak', 'Sabita',
  'Arjun', 'Kamala', 'Suresh', 'Meera', 'Prakash',
  'Gita', 'Ramesh', 'Sita', 'Manoj', 'Durga',
  'Naresh', 'Puja', 'Dinesh', 'Sarita', 'Kiran',
];
const doctorLastNames = [
  'Sharma', 'Thapa', 'Shrestha', 'Rai', 'Gurung',
  'Tamang', 'Karki', 'Poudel', 'Adhikari', 'Bhandari',
  'Acharya', 'Lamichhane', 'Khatri', 'Magar', 'Limbu',
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function seed() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create hospitals table
    await connection.execute(`
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
    console.log('✔ hospitals table ready');

    // 2. Add hospital_id column to doctors if missing
    const [cols] = await connection.execute('DESCRIBE doctors');
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes('hospital_id')) {
      await connection.execute('ALTER TABLE doctors ADD COLUMN hospital_id INT NULL');
      console.log('✔ Added hospital_id to doctors table');
    }

    // 3. Ensure specialties exist
    const [catRows] = await connection.execute('SELECT id FROM medical_categories LIMIT 1');
    let catId;
    if (catRows.length === 0) {
      const [catRes] = await connection.execute('INSERT INTO medical_categories (name, status) VALUES (?, ?)', ['General Medicine', 'Active']);
      catId = catRes.insertId;
    } else {
      catId = catRows[0].id;
    }

    const specIdMap = {};
    for (const spec of specializations) {
      const [existing] = await connection.execute('SELECT id FROM specialties WHERE name = ?', [spec]);
      if (existing.length > 0) {
        specIdMap[spec] = existing[0].id;
      } else {
        const [res] = await connection.execute('INSERT INTO specialties (category_id, name, status) VALUES (?, ?, ?)', [catId, spec, 'Active']);
        specIdMap[spec] = res.insertId;
      }
    }
    console.log('✔ Specialties ready:', Object.keys(specIdMap));

    // 4. Clear existing seeded hospitals (optional: skip if you want to keep)
    await connection.execute('DELETE FROM hospitals');
    console.log('✔ Cleared old hospitals');

    // 5. Insert hospitals + doctors
    const salt = await bcrypt.genSalt(8);
    const hashedPw = await bcrypt.hash('Doctor@123', salt);

    let doctorCount = 0;
    for (const hosp of hospitals) {
      const [hRes] = await connection.execute(
        'INSERT INTO hospitals (name, location, type, phone, description) VALUES (?, ?, ?, ?, ?)',
        [hosp.name, hosp.location, hosp.type, hosp.phone, hosp.description]
      );
      const hospId = hRes.insertId;

      // 15 doctors per hospital (3 per specialization, cycling through 5 specializations)
      const hospSpecs = specializations.slice(0, 5);
      for (let i = 0; i < 15; i++) {
        const spec = hospSpecs[i % 5];
        const specId = specIdMap[spec];
        const firstName = doctorFirstNames[i % doctorFirstNames.length];
        const lastName = pick(doctorLastNames);
        const name = `Dr. ${firstName} ${lastName}`;
        const emailBase = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${hospId}${i}`;
        const email = `${emailBase}@eswasthya.np`;
        const experience = randInt(3, 25);
        const fee = (randInt(3, 15) * 100);
        const rating = (3.5 + Math.random() * 1.5).toFixed(1);
        const bio = `${name} is a specialist in ${spec} with ${experience} years of experience at ${hosp.name}.`;

        // Insert user
        const [uRes] = await connection.execute(
          'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, TRUE)',
          [name, email, hashedPw, 'doctor']
        );
        const userId = uRes.insertId;

        // Insert doctor
        await connection.execute(
          `INSERT INTO doctors (user_id, specialty_id, specialization, experience, hospital, hospital_id, bio, location, working_hours, fee, rating)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, specId, spec, experience, hosp.name, hospId, bio, hosp.location, '9 AM - 5 PM', fee, rating]
        );
        doctorCount++;
      }
      console.log(`✔ Hospital: ${hosp.name} — 15 doctors added`);
    }

    await connection.commit();
    console.log(`\n✅ Seeding complete! ${hospitals.length} hospitals, ${doctorCount} doctors inserted.`);
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('❌ Seed error:', err.message, err.sqlMessage || '');
    process.exit(1);
  } finally {
    connection.release();
  }
}

seed();
