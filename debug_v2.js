const db = require('./backend/config/db');

async function debug() {
  try {
    const [doctors] = await db.execute(`
      SELECT d.id as doc_id, u.name as doctor_name, d.hospital_id, h.name as hospital_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN hospitals h ON d.hospital_id = h.id
      WHERE u.name LIKE '%Rajiv%'
    `);
    
    console.log('RAJIV_DATA_START');
    doctors.forEach(d => {
      console.log(`DOC_ID:${d.doc_id}|NAME:${d.doctor_name}|HOSP_ID:${d.hospital_id}|HOSP_NAME:${d.hospital_name}`);
    });
    console.log('RAJIV_DATA_END');

    const [hospitals] = await db.execute("SELECT id, name FROM hospitals WHERE name LIKE '%Sanepa%'");
    console.log('SANEPA_DATA_START');
    hospitals.forEach(h => {
      console.log(`HOSP_ID:${h.id}|NAME:${h.name}`);
    });
    console.log('SANEPA_DATA_END');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
