const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 1,       // free DB allows very few connections
    queueLimit: 10,
    idleTimeout: 10000,       // release idle connections after 10s
    enableKeepAlive: false,
    dateStrings: true
});

// Gracefully handle pool errors
pool.on('connection', (conn) => {
    conn.on('error', (err) => {
        console.error('[DB] Connection error:', err.message);
    });
});

module.exports = pool;
