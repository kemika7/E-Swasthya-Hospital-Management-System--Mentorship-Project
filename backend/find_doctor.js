const db = require('./config/db');

async function findDoctor() {
    try {
        const [rows] = await db.execute("SELECT name, email FROM users WHERE name LIKE '%Sarita Pathak%'");
        console.log(JSON.stringify(rows));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findDoctor();
