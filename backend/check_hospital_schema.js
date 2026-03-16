const db = require('./config/db');

async function checkSchema() {
    try {
        console.log('Checking users table details:');
        const [usersCols] = await db.execute('DESCRIBE users');
        console.table(usersCols);

        console.log('\nChecking doctors table details:');
        const [doctorsCols] = await db.execute('DESCRIBE doctors');
        console.table(doctorsCols);

        console.log('\nChecking hospitals table details:');
        const [hospitalsCols] = await db.execute('DESCRIBE hospitals');
        console.table(hospitalsCols);

        console.log('\nChecking appointments table details:');
        const [appointmentsCols] = await db.execute('DESCRIBE appointments');
        console.table(appointmentsCols);

    } catch (err) {
        console.error('Error checking schema:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSchema();
