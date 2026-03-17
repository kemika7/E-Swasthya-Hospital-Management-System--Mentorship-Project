const db = require('./config/db');

const initTable = async () => {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS patient_health_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                date DATE NOT NULL,
                weight FLOAT,
                blood_pressure_sys INT,
                blood_pressure_dia INT,
                sugar_level FLOAT,
                heart_rate INT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
            )
        `;
        await db.execute(sql);
        console.log('patient_health_data table initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating patient_health_data table:', err);
        process.exit(1);
    }
};

initTable();
