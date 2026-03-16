const db = require('./config/db');
require('dotenv').config();

async function verify() {
  try {
    const [tables] = await db.execute('SHOW TABLES');
    console.log('Tables in DB:', tables.map(t => Object.values(t)[0]));
    
    if (tables.some(t => Object.values(t)[0] === 'reports')) {
      const [desc] = await db.execute('DESCRIBE reports');
      console.log('Schema for reports:');
      console.table(desc);
    } else {
      console.log('Reports table NOT found.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Verify error:', err);
    process.exit(1);
  }
}

verify();
