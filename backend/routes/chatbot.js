const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Groq = require('groq-sdk');

require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get all active doctors from DB, optionally filtered by hospital
const getDoctorsForHospital = async (hospitalId) => {
  try {
    let query = `
      SELECT d.*, u.name as doctor_name, u.email, s.name as specialty_name
      FROM doctors d 
      JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
    `;
    const params = [];

    if (hospitalId) {
      query += ` WHERE d.hospital_id = ? `;
      params.push(hospitalId);
    }

    query += ` ORDER BY u.name `;
    
    const [doctors] = await db.execute(query, params);
    return doctors;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

// Get patient health metrics if patient ID is provided
const getPatientHealthData = async (patientId) => {
  if (!patientId) return null;
  try {
    const [rows] = await db.execute(
      `SELECT * FROM health_tracking WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1`,
      [patientId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching patient health data:', error);
    return null;
  }
};

// Enhanced symptom-to-specialization mapping
const symptomMap = [
  { keywords: ['fever', 'flu', 'cold', 'body ache', 'weakness', 'fatigue', 'tiredness', 'general illness'], specialty: 'General Physician' },
  { keywords: ['chest pain', 'heart', 'cardiac', 'palpitation', 'chest tightness', 'chest pressure', 'arm pain', 'jaw pain', 'heart racing', 'irregular heartbeat'], specialty: 'Cardiologist' },
  { keywords: ['joint pain', 'bone', 'bone fracture', 'arthritis', 'back pain', 'knee pain', 'sprain', 'muscle pain'], specialty: 'Orthopedist' },
  { keywords: ['stomach', 'digestion', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating', 'acid reflux', 'abdominal pain', 'gastric'], specialty: 'Gastroenterologist' },
  { keywords: ['skin', 'rash', 'acne', 'itching', 'eczema', 'psoriasis', 'hives', 'skin infection', 'fungal'], specialty: 'Dermatologist' },
  { keywords: ['eye', 'vision', 'blur', 'blurry vision', 'eye pain', 'red eye', 'watery eye', 'double vision'], specialty: 'Ophthalmologist' },
  { keywords: ['ear', 'nose', 'throat', 'sinus', 'ear pain', 'hearing loss', 'tonsils', 'sore throat', 'nasal congestion', 'snoring'], specialty: 'ENT Specialist' },
  { keywords: ['diabetes', 'thyroid', 'hormone', 'weight gain', 'weight loss', 'excessive thirst', 'frequent urination'], specialty: 'Endocrinologist' },
  { keywords: ['pregnancy', 'women health', 'period', 'menstrual', 'irregular period', 'pelvic pain', 'breast lump', 'fertility'], specialty: 'Gynecologist' },
  { keywords: ['child', 'baby', 'pediatric', 'infant', 'toddler', 'newborn', 'child fever', 'child cough'], specialty: 'Pediatrician' },
  { keywords: ['kidney', 'urinary', 'urine', 'kidney stone', 'blood in urine', 'kidney pain', 'swelling in legs'], specialty: 'Nephrologist' },
  { keywords: ['cough', 'breath', 'asthma', 'lung', 'breathing difficulty', 'shortness of breath', 'wheezing', 'pneumonia', 'tuberculosis', 'chest congestion'], specialty: 'Pulmonologist' },
  { keywords: ['headache', 'brain', 'seizure', 'neurology', 'migraine', 'dizziness', 'vertigo', 'numbness', 'tingling', 'memory loss', 'paralysis', 'stroke'], specialty: 'Neurologist' },
  { keywords: ['tooth', 'dental', 'gum', 'toothache', 'cavity', 'bleeding gums', 'jaw pain'], specialty: 'Dentist' },
  { keywords: ['stress', 'mental', 'anxiety', 'depression', 'insomnia', 'panic', 'mood swings', 'suicidal', 'hallucination', 'sleep disorder'], specialty: 'Psychiatrist' },
  { keywords: ['cancer', 'tumor', 'lump', 'abnormal growth', 'chemotherapy'], specialty: 'Oncologist' },
  { keywords: ['allergy', 'allergic reaction', 'hay fever', 'food allergy', 'swelling', 'anaphylaxis'], specialty: 'Allergist' },
];

// POST /api/chatbot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], hospitalId, patientId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const allDoctors = await getDoctorsForHospital(hospitalId);
    const patientHealth = await getPatientHealthData(patientId);

    const doctorContext = allDoctors.length > 0 
      ? allDoctors.map(d => `- Dr. ${d.doctor_name} (${d.specialty_name || 'Specialist'}, Experience: ${d.experience || 'N/A'} yrs, Rating: ${d.rating || 'N/A'}/5), ID: ${d.id}`).join('\n')
      : "No doctors currently available in this hospital.";

    let patientContext = '';
    if (patientHealth) {
      patientContext = `
PATIENT'S LATEST HEALTH DATA (use this for personalized advice):
- Blood Pressure: ${patientHealth.blood_pressure_systolic || 'N/A'}/${patientHealth.blood_pressure_diastolic || 'N/A'} mmHg
- Heart Rate: ${patientHealth.heart_rate || 'N/A'} bpm
- BMI: ${patientHealth.bmi || 'N/A'}
- Blood Sugar: ${patientHealth.sugar_level || 'N/A'} mg/dL
- Temperature: ${patientHealth.temperature || 'N/A'} °F
- Oxygen Saturation: ${patientHealth.oxygen_saturation || 'N/A'}%
- Weight: ${patientHealth.weight || 'N/A'} kg
- Recorded: ${patientHealth.recorded_at ? new Date(patientHealth.recorded_at).toLocaleDateString() : 'N/A'}
`;
    }

    const systemPrompt = `You are "Swasthya AI", an intelligent medical assistant built into the E-Swasthya Hospital Management System.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Your name is Swasthya AI.
- You are a professional, empathetic AI health assistant.
- You NEVER give a final diagnosis or prescribe medication.
- You ALWAYS recommend consulting a real doctor.
- You ONLY respond to health and medical topics. For anything else, politely redirect.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATTING RULES (CRITICAL — FOLLOW EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Use **text** for bold section headers only.
- Use plain bullet points with "- " for lists.
- Use [Doctor Name](/patient/doctor/ID) for doctor links.
- End EVERY response with this exact line (no asterisks, no italics):
  Swasthya AI is not a substitute for professional medical advice. Please consult a doctor.
- Do NOT use *italic* anywhere in your response.
- Do NOT use tab characters or "+" for bullet points — only use "- ".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — EXTRACT SYMPTOMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Convert casual or messy user language into clean medical symptom terms.
Examples:
- "my chest feels tight and I feel dizzy" → chest tightness, dizziness
- "stomach is killing me, can't stop throwing up" → severe abdominal pain, vomiting
- "I coughed up blood and my chest hurts" → hemoptysis (coughing blood), chest pain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — DETECT POSSIBLE CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply medical pattern matching:

CARDIAC: chest pain/pressure + arm/jaw pain + shortness of breath + cold sweat + dizziness
→ May indicate: Heart-related condition or cardiac event warning signs

RESPIRATORY: cough + fever + chest pain + fatigue + breathing difficulty
→ May indicate: Pneumonia, bronchitis, or respiratory infection

HEMOPTYSIS (coughing blood) + chest pain + weight loss + night sweats
→ May indicate: Tuberculosis, lung infection, or pulmonary condition

GASTROINTESTINAL BLEEDING: blood in stool + abdominal pain + weakness
→ May indicate: GI bleeding, ulcer, or colorectal condition

NEUROLOGICAL: sudden severe headache + confusion + numbness + slurred speech
→ May indicate: Stroke warning signs (EMERGENCY)

MIGRAINE: headache + eye pain + nausea + light sensitivity
→ May indicate: Migraine

DIABETES: excessive thirst + frequent urination + fatigue + blurry vision
→ May indicate: Diabetes-related condition

MENTAL HEALTH: persistent sadness + sleep changes + loss of interest + appetite changes
→ May indicate: Depression or mood disorder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — SEVERITY ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 HIGH PRIORITY — Seek IMMEDIATE emergency care:
- Chest pain with arm/jaw radiation
- Coughing or vomiting blood
- Blood in stool with dizziness/weakness
- Severe breathing difficulty
- Stroke symptoms (sudden confusion, numbness, slurred speech)
- Loss of consciousness
- Anaphylaxis
- Suicidal thoughts

🟡 MODERATE PRIORITY — See a doctor within 24-48 hours:
- Persistent fever over 3 days
- Recurring headaches
- Unexplained weight loss
- Persistent cough
- Moderate abdominal pain

🟢 NORMAL PRIORITY — Schedule a routine appointment:
- Common cold or mild flu
- Minor skin issues
- Routine check-ups
- Mild aches

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — SPECIALTY MATCHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Heart → Cardiologist
- Lungs/Breathing/Coughing blood → Pulmonologist
- Brain/Nerves/Headache → Neurologist
- Stomach/Digestion/GI bleeding → Gastroenterologist
- Bones/Joints/Muscles → Orthopedist
- Skin → Dermatologist
- Eyes → Ophthalmologist
- Ear/Nose/Throat → ENT Specialist
- Diabetes/Thyroid/Hormones → Endocrinologist
- Women's health/Pregnancy → Gynecologist
- Children → Pediatrician
- Kidney/Urinary → Nephrologist
- Teeth/Gums → Dentist
- Mental health/Anxiety/Depression → Psychiatrist
- Cancer/Tumors → Oncologist
- Allergies → Allergist
- General/Unclear → General Physician

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — DOCTOR RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE DOCTORS:
${doctorContext}

- Pick the best specialty match with highest rating/experience.
- Format: [Dr. Name](/patient/doctor/ID) — Specialty
- If no match: "You may need a [SPECIALTY]. No matching doctor is currently available in your hospital. Please visit the emergency department."
${patientContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — RESPONSE STRUCTURE (USE EXACTLY THIS FORMAT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🔍 Symptoms Identified:**
- [symptom 1]
- [symptom 2]

**🩺 Possible Condition:**
This may indicate [condition]. [1-2 sentence explanation.]

**⚠️ Severity Level:**
🔴 HIGH PRIORITY — Please seek immediate medical attention.
OR 🟡 MODERATE PRIORITY — See a doctor within 24-48 hours.
OR 🟢 NORMAL PRIORITY — Schedule a routine appointment.

**👨‍⚕️ Recommended Doctor:**
[Dr. Name](/patient/doctor/ID) — [Specialty]

**💡 Advice:**
- [actionable step 1]
- [actionable step 2]
- [actionable step 3]

Swasthya AI is not a substitute for professional medical advice. Please consult a doctor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: "Chest pain spreading to my arm, dizzy and nauseous"

**🔍 Symptoms Identified:**
- Chest pain (pressure-type)
- Pain radiating to left arm
- Dizziness
- Nausea

**🩺 Possible Condition:**
This may indicate a heart-related condition or early warning signs of a cardiac event.

**⚠️ Severity Level:**
🔴 HIGH PRIORITY — Please seek immediate medical attention.

**👨‍⚕️ Recommended Doctor:**
[Dr. Ram Sharma](/patient/doctor/1) — Cardiologist

**💡 Advice:**
- Call emergency services or go to the nearest emergency department immediately.
- Rest and avoid any physical exertion.
- Do not eat or drink anything until evaluated by a doctor.
- If you have prescribed heart medication, take it as directed.

Swasthya AI is not a substitute for professional medical advice. Please consult a doctor.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_completion_tokens: 1500,
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('Chatbot backend error:', error);
    res.status(500).json({ reply: 'I am sorry, I am experiencing technical difficulties. Please try again later.' });
  }
});

// GET /api/chatbot/doctor-details/:id
router.get('/doctor-details/:id', async (req, res) => {
  try {
    const [doctor] = await db.execute(`
      SELECT d.*, u.name as doctor_name, u.email, s.name as specialty_name
      FROM doctors d 
      JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE d.id = ?
    `, [req.params.id]);
    if (doctor.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor[0]);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
