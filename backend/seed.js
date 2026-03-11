const db = require('./config/db');
const bcrypt = require('bcryptjs');

const categories = [
    { name: 'Primary Care & General', specialties: ['General Practitioner (GP)', 'Family Medicine Physician', 'Internal Medicine Physician (Internist)', 'Primary Care Physician', 'Preventive Medicine Specialist'] },
    { name: 'Brain, Nerves & Mental Health', specialties: ['Neurologist', 'Neurosurgeon', 'Psychiatrist', 'Psychologist', 'Child & Adolescent Psychiatrist', 'Behavioral Medicine Specialist', 'Neuropsychiatrist', 'Sleep Medicine Specialist'] },
    { name: 'Heart & Blood', specialties: ['Cardiologist', 'Interventional Cardiologist', 'Cardiac Electrophysiologist', 'Cardiothoracic Surgeon', 'Vascular Surgeon', 'Hematologist'] },
    { name: 'Lungs & Breathing', specialties: ['Pulmonologist', 'Critical Care Specialist (Intensivist)', 'Respiratory Medicine Specialist', 'Sleep Apnea Specialist'] },
    { name: 'Digestive System', specialties: ['Gastroenterologist', 'Hepatologist', 'Colorectal Surgeon', 'Bariatric Surgeon'] },
    { name: 'Skin, Hair & Nails', specialties: ['Dermatologist', 'Dermatopathologist', 'Cosmetic Dermatologist', 'Trichologist'] },
    { name: 'Eyes, Ears, Nose & Throat', specialties: ['Ophthalmologist', 'Optometrist', 'ENT Specialist', 'Audiologist'] },
    { name: 'Bones, Joints & Muscles', specialties: ['Orthopedic Surgeon', 'Rheumatologist', 'Sports Medicine Doctor', 'Physical Medicine & Rehabilitation', 'Chiropractor', 'Osteopathic Physician'] },
    { name: 'Hormones & Metabolism', specialties: ['Endocrinologist', 'Diabetologist', 'Metabolic Specialist'] },
    { name: 'Kidneys & Urinary System', specialties: ['Nephrologist', 'Urologist', 'Urogynecologist'] },
    { name: 'Women’s Health', specialties: ['Gynecologist', 'Obstetrician', 'OB-GYN', 'Reproductive Endocrinologist', 'Maternal–Fetal Medicine Specialist'] },
    { name: 'Children’s Health', specialties: ['Pediatrician', 'Pediatric Specialist', 'Neonatologist', 'Pediatric Cardiologist', 'Pediatric Neurologist', 'Pediatric Surgeon'] },
    { name: 'Cancer & Specialized Care', specialties: ['Medical Oncologist', 'Radiation Oncologist', 'Surgical Oncologist', 'Hematology-Oncologist', 'Palliative Care Specialist'] },
    { name: 'Diagnostics & Imaging', specialties: ['Radiologist', 'Interventional Radiologist', 'Nuclear Medicine Specialist', 'Pathologist', 'Clinical Pathologist'] },
    { name: 'Infectious & Immune System', specialties: ['Infectious Disease Specialist', 'Immunologist', 'Allergist', 'Clinical Immunologist'] },
    { name: 'Pain & Anesthesia', specialties: ['Anesthesiologist', 'Pain Management Specialist', 'Palliative Medicine Doctor'] },
    { name: 'Emergency & Hospital Care', specialties: ['Emergency Medicine Physician', 'Trauma Surgeon', 'Hospitalist', 'Critical Care Physician'] },
    { name: 'Dental', specialties: ['General Dentist', 'Orthodontist', 'Periodontist', 'Endodontist', 'Oral & Maxillofacial Surgeon', 'Prosthodontist', 'Pediatric Dentist'] },
    { name: 'Other & Preventive', specialties: ['Geriatrician', 'Occupational Medicine Physician', 'Public Health Specialist', 'Travel Medicine Specialist', 'Lifestyle Medicine Physician', 'Sexual Health Specialist'] }
];

const nepaliFirstNames = ['Arjun', 'Bikram', 'Chandra', 'Dipendra', 'Elina', 'Ishwor', 'Karuna', 'Laxman', 'Maya', 'Niraj', 'Pranisha', 'Rajesh', 'Sabina', 'Tulsi', 'Uttam', 'Sanjay', 'Gita', 'Ramesh', 'Sita', 'Hari', 'Bimala', 'Sunil', 'Anita', 'Kiran', 'Pratima', 'Suresh', 'Kalpana', 'Binod', 'Sarita', 'Prakash'];
const nepaliLastNames = ['Adhikari', 'Baral', 'Chhetri', 'Dahal', 'Gurung', 'Karki', 'Lama', 'Magar', 'Poudel', 'Rai', 'Shrestha', 'Thapa', 'Yadav', 'Bhattarai', 'Gautam', 'Kc', 'Pandey', 'Tamang', 'Bashyal', 'Ghimire', 'Regmi', 'Sedai', 'Sharma', 'Pathak', 'Subedi', 'Mainali', 'Kharel', 'Pokhrel', 'Bhandari', 'Paudel'];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    try {
        console.log('Starting clear-out of existing categories/specialties/doctors...');
        // Optional: Keep users but clear doctors/specialties for a clean slate
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        // Delete only seeded doctors to keep manual test accounts if any
        await db.execute('DELETE FROM doctors WHERE user_id IN (SELECT id FROM users WHERE email LIKE "doc_%@eswasthya.com")');
        await db.execute('DELETE FROM users WHERE email LIKE "doc_%@eswasthya.com"');
        await db.execute('DELETE FROM specialties');
        await db.execute('DELETE FROM medical_categories');
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        console.log('Seeding categories and specialties...');
        let doctorCount = 1;

        for (const cat of categories) {
            const [catResult] = await db.execute('INSERT INTO medical_categories (name) VALUES (?)', [cat.name]);
            const categoryId = catResult.insertId;

            for (const specName of cat.specialties) {
                const [specResult] = await db.execute('INSERT INTO specialties (category_id, name) VALUES (?, ?)', [categoryId, specName]);
                const specialtyId = specResult.insertId;

                console.log(`  Seeding 10 doctors for: ${specName}...`);
                for (let i = 0; i < 10; i++) {
                    const firstName = getRandom(nepaliFirstNames);
                    const lastName = getRandom(nepaliLastNames);
                    const fullName = `Dr. ${firstName} ${lastName}`;
                    const email = `doc_${doctorCount}@eswasthya.com`;

                    const [userResult] = await db.execute(
                        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        [fullName, email, password, 'doctor']
                    );
                    const userId = userResult.insertId;

                    await db.execute(
                        'INSERT INTO doctors (user_id, specialty_id, experience, hospital, fee, dob, blood_group, working_hours, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            userId,
                            specialtyId,
                            5 + Math.floor(Math.random() * 20),
                            'E-Swasthya General Hospital',
                            500 + (Math.floor(Math.random() * 10) * 100),
                            `19${70 + Math.floor(Math.random() * 25)}-01-01`,
                            getRandom(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-']),
                            '10 AM - 4 PM',
                            getRandom(['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan'])
                        ]
                    );
                    doctorCount++;
                }
            }
        }

        console.log('Seeding patients...');
        for (let i = 0; i < 20; i++) {
            const firstName = getRandom(nepaliFirstNames);
            const lastName = getRandom(nepaliLastNames);
            const fullName = `${firstName} ${lastName}`;
            const email = `patient${i + 1}@eswasthya.com`;

            await db.execute(
                'INSERT INTO patients (name, email, password, phone, age, gender, address, medical_history, status, profile_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    fullName,
                    email,
                    password,
                    '98' + Math.floor(10000000 + Math.random() * 90000000),
                    20 + Math.floor(Math.random() * 50),
                    getRandom(['Male', 'Female']),
                    getRandom(['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara']),
                    'No significant medical history. Regular checkup.',
                    'Active',
                    '/images/default-avatar.png'
                ]
            );
        }

        console.log(`Seeding complete! Created ${categories.length} categories, many specialties, and ${doctorCount - 1} doctors, plus 20 patients.`);

        console.log('Seeding initial appointments...');
        const [patients] = await db.execute('SELECT patient_id FROM patients LIMIT 5');
        const [doctors] = await db.execute('SELECT id FROM doctors LIMIT 5');

        for (let i = 0; i < patients.length; i++) {
            const patientId = patients[i].patient_id;
            const doctorId = doctors[i].id;

            // One upcoming appointment
            await db.execute(
                'INSERT INTO appointments (patient_id, doctor_id, date, time, duration, status, appointment_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    patientId,
                    doctorId,
                    new Date(Date.now() + 86400000 * (i + 1)).toISOString().split('T')[0], // Next few days
                    '10:30:00',
                    30,
                    'Scheduled',
                    'Consultation',
                    'Initial checkup session.'
                ]
            );

            // One past appointment
            await db.execute(
                'INSERT INTO appointments (patient_id, doctor_id, date, time, duration, status, appointment_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    patientId,
                    doctorId,
                    new Date(Date.now() - 86400000 * (i + 1)).toISOString().split('T')[0], // Last few days
                    '09:00:00',
                    30,
                    'Completed',
                    'Follow-up',
                    'Patient was recovering well.'
                ]
            );
        }

        console.log('Seeding appointments completed.');
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
}

seed();
