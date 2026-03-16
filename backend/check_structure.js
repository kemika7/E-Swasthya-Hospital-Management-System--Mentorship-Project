const db = require('./config/db');

async function checkStructure() {
    try {
        console.log('--- USERS Table Structure ---');
        const [userCols] = await db.execute('SHOW COLUMNS FROM users');
        console.table(userCols);

        console.log('--- DOCTORS Table Structure ---');
        const [docCols] = await db.execute('SHOW COLUMNS FROM doctors');
        console.table(docCols);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        process.exit();
    }
}

checkStructure();
