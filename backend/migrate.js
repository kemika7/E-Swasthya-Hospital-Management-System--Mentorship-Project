const db = require('./config/db');

async function migrate() {
    try {
        console.log('Checking columns in doctors table...');
        const [columns] = await db.execute('DESCRIBE doctors');
        const columnNames = columns.map(c => c.Field);

        const newColumns = [
            { name: 'location', def: "VARCHAR(255) DEFAULT 'Kathmandu, Nepal'" },
            { name: 'dob', def: 'DATE' },
            { name: 'blood_group', def: 'VARCHAR(5)' },
            { name: 'working_hours', def: "VARCHAR(100) DEFAULT '9 AM - 5 PM'" },
            { name: 'specialty_id', def: 'INT' }
        ];

        for (const col of newColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`Adding column: ${col.name}`);
                await db.execute(`ALTER TABLE doctors ADD COLUMN ${col.name} ${col.def}`);
            } else {
                console.log(`Column ${col.name} already exists.`);
            }
        }

        console.log('Creating medical_categories table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS medical_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT NULL
            )
        `);

        console.log('Creating specialties table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS specialties (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT NULL,
                FOREIGN KEY (category_id) REFERENCES medical_categories(id) ON DELETE CASCADE
            )
        `);

        console.log('Creating announcements table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Recreating patients and dependent tables...');
        // Disable foreign key checks to allow dropping/recreating tables with dependencies
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        await db.execute('DROP TABLE IF EXISTS appointments');
        await db.execute('DROP TABLE IF EXISTS reports');
        await db.execute('DROP TABLE IF EXISTS patients');

        await db.execute(`
            CREATE TABLE patients (
                patient_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                age INT NOT NULL,
                gender VARCHAR(20) NOT NULL,
                address TEXT NOT NULL,
                medical_history TEXT NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Active',
                profile_pic VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Recreating appointments table...');
        await db.execute(`
            CREATE TABLE appointments (
                appointment_id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                duration INT DEFAULT 30,
                status VARCHAR(50) DEFAULT 'Scheduled',
                appointment_type VARCHAR(100) DEFAULT 'Consultation',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
            )
        `);

        console.log('Recreating reports table...');
        await db.execute(`
            CREATE TABLE reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                report_date DATE NOT NULL,
                diagnosis TEXT,
                prescription TEXT,
                notes TEXT,
                file_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
            )
        `);

        await db.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Migrations completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrate();
