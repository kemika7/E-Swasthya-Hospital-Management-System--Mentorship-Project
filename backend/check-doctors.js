const db = require('./config/db');
(async () => {
  try {
    const [cols] = await db.execute('DESCRIBE doctors');
    for (const c of cols) {
      console.log(c.Field, '-', c.Type);
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
})();
