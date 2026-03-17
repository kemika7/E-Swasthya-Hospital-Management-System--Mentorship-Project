const db = require('./backend/config/db');

async function debugRajiv() {
  try {
    // 1. Find the user Rajiv
    const [users] = await db.execute("SELECT id, name, email, role FROM users WHERE name LIKE '%Rajiv%'");
    console.log('--- USERS matching Rajiv ---');
    console.log(JSON.stringify(users, null, 2));

    if (users.length > 0) {
      const userIds = users.map(u => u.id);
      // 2. Find the doctor record
      const [doctors] = await db.execute(`
        SELECT d.*, h.name as hospital_name 
        FROM doctors d 
        LEFT JOIN hospitals h ON d.hospital_id = h.id 
        WHERE d.user_id IN (${userIds.join(',')})
      `);
      console.log('--- DOCTOR records ---');
      console.log(JSON.stringify(doctors, null, 2));
    }

    // 3. Check all hospitals to see Sanepa Hospital ID
    const [hospitals] = await db.execute("SELECT id, name FROM hospitals");
    console.log('--- ALL HOSPITALS ---');
    console.log(JSON.stringify(hospitals, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugRajiv();
