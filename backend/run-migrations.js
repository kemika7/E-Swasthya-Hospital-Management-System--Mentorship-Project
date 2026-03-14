const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
};

async function migrate() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to the database. Running migrations...');

        const queries = [
            "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE patients ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;",
            `CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(10) NOT NULL,
                type ENUM('registration', 'reset') NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        ];

        for (const query of queries) {
            try {
                await connection.execute(query);
                console.log(`Successfully executed: ${query}`);
            } catch (err) {
                // Ignore "duplicate column" errors
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists, skipping: ${query}`);
                } else {
                    console.error(`Error executing query: ${query}`, err.message);
                }
            }
        }

        console.log('Migration complete.');
        connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
