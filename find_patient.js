const db = require('./backend/config/db');

async function findPatient() {
  try {
    const [users] = await db.execute("SELECT email, role FROM users WHERE role = 'patient' LIMIT 5");
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findPatient();
