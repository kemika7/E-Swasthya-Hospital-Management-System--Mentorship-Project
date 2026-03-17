const db = require('./backend/config/db');

async function listTables() {
  try {
    const [tables] = await db.execute("SHOW TABLES");
    console.log(JSON.stringify(tables, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listTables();
