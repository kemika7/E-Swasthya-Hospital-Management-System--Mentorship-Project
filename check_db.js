const db = require('./backend/config/db');

async function checkDoctors() {
  try {
    const [doctors] = await db.execute(`
      SELECT d.id as doc_id, u.name, d.hospital_id, h.name as hospital_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN hospitals h ON d.hospital_id = h.id
    `);
    console.log('--- Doctors in Database ---');
    console.table(doctors);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDoctors();
