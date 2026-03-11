const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function init() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Cleaning up old tables...');
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        const tables = ['reports', 'appointments', 'doctors', 'patients', 'users'];
        for (let t of tables) {
            await db.execute(`DROP TABLE IF EXISTS ${t}`);
        }
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Applying new schema...');
        // Split by semicolon but preserve those inside functions or procedures if any
        // For simple schemas, splitting by semicolon is fine.
        const statements = schema.split(';').filter(s => s.trim());

        for (let s of statements) {
            console.log(`Executing: ${s.substring(0, 50)}...`);
            await db.execute(s);
        }

        console.log('Schema re-initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Initialization failed:', err.message);
        process.exit(1);
    }
}

init();
