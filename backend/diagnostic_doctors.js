const db = require('./config/db');

async function diagnostic() {
    try {
        console.log('--- Checking Last 5 Doctors ---');
        const [rows] = await db.execute(`
            SELECT d.id, u.name, u.email, u.phone, d.qualification, d.working_hours, d.location
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.id DESC
            LIMIT 5
        `);
        console.table(rows);
    } catch (err) {
        console.error('Diagnostic failed:', err);
    } finally {
        process.exit();
    }
}

diagnostic();
