const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing connection with:');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });
        console.log('SUCCESS: Connection established.');
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('Query result:', rows[0].result);
        await connection.end();
    } catch (err) {
        console.error('FAILURE: Connection failed.');
        console.error(err);
    }
}

testConnection();
