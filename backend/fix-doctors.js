const db = require('./config/db');
(async () => {
  try {
    // Check users table
    const [uc] = await db.execute('DESCRIBE users');
    console.log('Users columns:', uc.map(r => r.Field).join(', '));
    
    // Check if is_verified exists
    if (!uc.map(r => r.Field).includes('is_verified')) {
      console.log('Adding is_verified to users...');
      await db.execute('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE');
      console.log('Done!');
    }
    
    // Check doctors table
    const [dc] = await db.execute('DESCRIBE doctors');
    console.log('Doctors columns:', dc.map(r => r.Field).join(', '));
    
    // Check specialties table
    const [sc] = await db.execute('DESCRIBE specialties');
    console.log('Specialties columns:', sc.map(r => r.Field).join(', '));
    
    // Check medical_categories table
    const [mc] = await db.execute('DESCRIBE medical_categories');
    console.log('Categories columns:', mc.map(r => r.Field).join(', '));
    
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
})();
