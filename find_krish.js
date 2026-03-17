const db = require('./backend/config/db');

async function findKrish() {
  try {
    const [users] = await db.execute("SELECT * FROM users WHERE name LIKE '%krish%' OR email LIKE '%krish%'");
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findKrish();
