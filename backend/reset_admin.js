const db = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
    try {
        const email = 'admin@hospital.com';
        const newPassword = 'admin'; 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`Resetting password for ${email} to '${newPassword}'`);
        const [result] = await db.execute(
            'UPDATE users SET password = ? WHERE email = ? AND role = ?',
            [hashedPassword, email, 'admin']
        );

        if (result.affectedRows > 0) {
            console.log(`Successfully reset password for ${email}`);
        } else {
            console.log(`Could not find admin user with email ${email}`);
        }
    } catch (err) {
        console.error('Error resetting admin password:', err);
    } finally {
        process.exit();
    }
}

resetAdminPassword();
