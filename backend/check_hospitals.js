const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [hospitals] = await db.execute('SELECT id, name FROM hospitals');
        console.log('--- HOSPITALS ---');
        console.log(JSON.stringify(hospitals, null, 2));

        const [admins] = await db.execute('SELECT id, email, hospital_id FROM users WHERE role = "admin"');
        console.log('\n--- ADMIN USERS ---');
        console.log(JSON.stringify(admins, null, 2));

        const [doctors] = await db.execute('SELECT id, name, user_id, hospital_id FROM doctors');
        console.log('\n--- DOCTORS ---');
        console.log(JSON.stringify(doctors, null, 2));

        await db.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
