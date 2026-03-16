const db = require('./config/db');

async function checkAndAddQualification() {
    try {
        const [columns] = await db.execute('SHOW COLUMNS FROM doctors LIKE "qualification"');
        if (columns.length === 0) {
            console.log('Adding qualification column to doctors table...');
            await db.execute('ALTER TABLE doctors ADD COLUMN qualification VARCHAR(255)');
            console.log('Qualification column added successfully.');
        } else {
            console.log('Qualification column already exists.');
        }
    } catch (err) {
        console.error('Error adding qualification:', err);
    } finally {
        process.exit();
    }
}

checkAndAddQualification();
