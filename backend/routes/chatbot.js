const express = require('express');
const router = express.Router();
const db = require('../config/db');

require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Get all active doctors from DB
const getAllDoctors = async () => {
  try {
    const [doctors] = await db.execute(`
      SELECT d.*, u.name as doctor_name, u.email, s.name as specialty_name
      FROM doctors d 
      JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE d.status = 'Active'
      ORDER BY u.name
    `);
    return doctors;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

// Full symptom-to-specialization mapping
const symptomMap = [
  { keywords: ['fever', 'cold', 'warm', 'flu', 'temperature', 'chills', 'hot'], specialty: 'General Physician' },
  { keywords: ['chest', 'heart', 'cardiac', 'cardiology', 'palpitation'], specialty: 'Cardiologist' },
  { keywords: ['bone', 'joint', 'ortho', 'knee', 'shoulder', 'fracture', 'spine', 'back pain'], specialty: 'Orthopedist' },
  { keywords: ['stomach', 'belly', 'digestion', 'gastro', 'nausea', 'vomit', 'diarrhea', 'constipation', 'acidity'], specialty: 'Gastroenterologist' },
  { keywords: ['skin', 'rash', 'acne', 'eczema', 'dermatology', 'itching', 'allergy'], specialty: 'Dermatologist' },
  { keywords: ['eye', 'vision', 'ophthalmology', 'sight', 'blind', 'retina', 'blur'], specialty: 'Ophthalmologist' },
  { keywords: ['ear', 'nose', 'throat', 'ent', 'sinus', 'tonsil', 'hearing', 'snoring'], specialty: 'ENT Specialist' },
  { keywords: ['hormone', 'thyroid', 'diabetes', 'sugar', 'insulin', 'endocrine'], specialty: 'Endocrinologist' },
  { keywords: ['women', 'pregnancy', 'period', 'gynecology', 'uterus', 'ovary', 'menstrual'], specialty: 'Gynecologist' },
  { keywords: ['child', 'baby', 'kid', 'pediatric', 'infant', 'toddler'], specialty: 'Pediatrician' },
  { keywords: ['kidney', 'urinary', 'urine', 'nephrology', 'bladder'], specialty: 'Nephrologist' },
  { keywords: ['lung', 'breathing', 'asthma', 'pulmonology', 'cough', 'respiratory', 'oxygen'], specialty: 'Pulmonologist' },
  { keywords: ['brain', 'mental', 'anxiety', 'depression', 'headache', 'neurology', 'nerve', 'seizure', 'migraine', 'dizziness'], specialty: 'Neurologist' },
  { keywords: ['psychiatry', 'stress', 'panic', 'mood', 'bipolar', 'schizophrenia'], specialty: 'Psychiatrist' },
  { keywords: ['teeth', 'tooth', 'dental', 'gum', 'cavity', 'dentist'], specialty: 'Dentist' },
  { keywords: ['blood', 'anemia', 'iron', 'hemoglobin', 'platelet'], specialty: 'General Physician' },
];

// Typo-tolerant specialty name map
const specialtyNameMap = [
  { variants: ['cardiology', 'cardiolgy', 'cadiology', 'caardiology', 'cardiologist', 'cardiac', 'heart specialist', 'heart doctor', 'heart'], specialty: 'Cardiologist' },
  { variants: ['orthopedics', 'orthopedic', 'orthopaedic', 'orthopaedics', 'orthopedist', 'ortho', 'bone doctor', 'joint specialist'], specialty: 'Orthopedist' },
  { variants: ['gastroenterology', 'gastro', 'gastrologist', 'gastroenterologist', 'stomach doctor', 'digestive'], specialty: 'Gastroenterologist' },
  { variants: ['dermatology', 'dermatologist', 'skin doctor', 'skin specialist'], specialty: 'Dermatologist' },
  { variants: ['ophthalmology', 'ophthalmologist', 'eye doctor', 'eye specialist', 'opthamology'], specialty: 'Ophthalmologist' },
  { variants: ['ent', 'ent specialist', 'ear nose throat', 'ear doctor', 'nose doctor'], specialty: 'ENT Specialist' },
  { variants: ['endocrinology', 'endocrinologist', 'diabetes doctor', 'thyroid specialist', 'hormone doctor'], specialty: 'Endocrinologist' },
  { variants: ['gynecology', 'gynecologist', 'gynae', 'gynae doctor', 'obstetrician', 'women doctor'], specialty: 'Gynecologist' },
  { variants: ['pediatrics', 'pediatrician', 'child doctor', 'baby doctor', 'paediatrics', 'paediatrician'], specialty: 'Pediatrician' },
  { variants: ['nephrology', 'nephrologist', 'kidney doctor', 'kidney specialist'], specialty: 'Nephrologist' },
  { variants: ['pulmonology', 'pulmonologist', 'lung doctor', 'lung specialist', 'respiratory', 'chest doctor'], specialty: 'Pulmonologist' },
  { variants: ['neurology', 'neurologist', 'brain doctor', 'nerve specialist', 'brain specialist'], specialty: 'Neurologist' },
  { variants: ['psychiatry', 'psychiatrist', 'mental health', 'mental doctor', 'psychology', 'psychologist'], specialty: 'Psychiatrist' },
  { variants: ['dentist', 'dentistry', 'dental', 'teeth doctor', 'tooth doctor'], specialty: 'Dentist' },
  { variants: ['general physician', 'general doctor', 'general medicine', 'gp', 'family doctor'], specialty: 'General Physician' },
];

// Match specialty from message (typo-tolerant)
const matchSpecialty = (message) => {
  const lower = message.toLowerCase();
  for (const entry of specialtyNameMap) {
    if (entry.variants.some(v => lower.includes(v))) return entry.specialty;
  }
  for (const entry of symptomMap) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.specialty;
  }
  return null;
};

// Build the doctor list context string for Gemini prompt
const buildDoctorList = (allDoctors) => {
  if (allDoctors.length === 0) return "No doctors are currently available.";
  const grouped = {};
  allDoctors.forEach(d => {
    const spec = d.specialty_name || 'General Physician';
    if (!grouped[spec]) grouped[spec] = [];
    if (grouped[spec].length < 3) {
      grouped[spec].push(`Dr. ${d.doctor_name} - [/patient/doctor/${d.id}]`);
    }
  });
  return Object.entries(grouped).map(([spec, docs]) =>
    `${spec}:\n${docs.map((d, i) => `  ${i + 1}. ${d}`).join('\n')}`
  ).join('\n\n');
};

// Rule-based fallback (works with no API)
const symptomToCondition = {
  'General Physician': [
    { keywords: ['warm', 'fever', 'temperature', 'chills', 'hot'], condition: 'It seems like you may have a fever.' },
    { keywords: ['cold', 'flu', 'runny nose', 'sneezing'], condition: 'It seems like you may have a cold or flu.' },
    { keywords: ['tired', 'fatigue', 'weakness'], condition: 'It seems like you may be experiencing fatigue.' },
  ],
  'Cardiologist': [
    { keywords: ['chest pain', 'palpitation', 'heart racing', 'irregular heartbeat'], condition: 'It seems like you may have heart-related symptoms.' },
  ],
  'Orthopedist': [
    { keywords: ['bone pain', 'joint pain', 'knee pain', 'shoulder pain', 'back pain'], condition: 'It seems like you may have a musculoskeletal issue.' },
  ],
  'Gastroenterologist': [
    { keywords: ['stomach pain', 'nausea', 'vomit', 'diarrhea', 'acidity', 'constipation'], condition: 'It seems like you may have a digestive issue.' },
  ],
  'Neurologist': [
    { keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness'], condition: 'It seems like you may have a neurological issue.' },
  ],
  'Pulmonologist': [
    { keywords: ['breathing difficulty', 'shortness of breath', 'asthma', 'wheezing', 'cough'], condition: 'It seems like you may have a respiratory issue.' },
  ],
};

const getConditionMessage = (message, specialty) => {
  const lower = message.toLowerCase();
  const conditions = symptomToCondition[specialty] || [];
  for (const entry of conditions) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.condition;
  }
  return null;
};

const isSpecializationQuery = (message) => {
  const lower = message.toLowerCase();
  return ['suggest', 'recommend', 'best doctor', 'good doctor', 'which doctor', 'doctor for', 'specialist for', 'specialist in', 'top doctor', 'give me doctor', 'need doctor', 'i need a'].some(t => lower.includes(t));
};

const generateLocalReply = (message, specialty, doctors) => {
  const lower = message.toLowerCase();
  const isGreeting = ['hi', 'hello', 'hey', 'howdy', 'good morning', 'good evening', 'namaste'].some(g => lower.includes(g));
  if (isGreeting && !specialty) return "Hello! How can I help you today?";

  const conditionMsg = specialty ? getConditionMessage(message, specialty) : null;

  if (specialty && doctors.length > 0) {
    const intro = conditionMsg
      ? `${conditionMsg} I recommend consulting a ${specialty}:\n`
      : isSpecializationQuery(message)
        ? `Here are the top ${doctors.length} ${specialty} doctors:\n`
        : `Based on your concern, I recommend seeing a ${specialty}:\n`;
    const docList = doctors.map((d, i) => `${i + 1}. Dr. ${d.doctor_name} - [/patient/doctor/${d.id}]`).join('\n');
    return intro + docList;
  }

  if (specialty && doctors.length === 0) {
    const condText = conditionMsg ? conditionMsg + ' ' : '';
    return `${condText}I recommend consulting a ${specialty}. No doctors are currently available for this specialty. Please contact us directly.`;
  }

  return "I am Swastha AI. Please describe your symptoms or ask for a specific doctor (e.g., \"I feel warm\", \"I need a cardiologist\").";
};

// POST /api/chatbot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const specialty = matchSpecialty(message);
    const allDoctors = await getAllDoctors();
    const matchedDoctors = specialty
      ? allDoctors.filter(d => {
          const dSpec = (d.specialty_name || d.specialization || '').toLowerCase();
          return dSpec.includes(specialty.toLowerCase());
        }).slice(0, 3)
      : [];

    // Try Gemini API first
    if (GEMINI_API_KEY) {
      try {
        const doctorListText = buildDoctorList(allDoctors);
        const systemPrompt = `You are Swastha AI, a professional, friendly, and fast virtual health assistant for a hospital patient portal.

Rules (strictly follow):
1. Symptom queries: If the patient describes symptoms (e.g. "I feel warm", "chest pain"), identify the likely disease and recommend exactly 3 doctors of the relevant specialty with profile links.
   Format: "It seems like you may have [DISEASE]. I recommend consulting a [SPECIALTY]:\n1. Dr. Name - [link]\n2. Dr. Name - [link]\n3. Dr. Name - [link]"
2. Specialty queries: If the patient asks for a specific specialty (e.g. "best cardiologist", "suggest doctor for cardiology"), recommend top 3 doctors of that specialty with links.
3. Greetings: respond naturally. Example: "Hello! How can I help you today?"
4. Never use Markdown asterisks. Keep responses short and empathetic.
5. Only recommend doctors from the list provided below. Do not hallucinate.
6. If no doctors are available for a specialty, say so clearly.

Symptom mapping:
- Fever/warm/cold -> General Physician
- Chest pain/heart -> Cardiologist
- Bone/joint pain -> Orthopedist
- Stomach/digestion -> Gastroenterologist
- Skin/rash -> Dermatologist
- Eyes -> Ophthalmologist
- Ear/nose/throat -> ENT Specialist
- Diabetes/thyroid -> Endocrinologist
- Women/pregnancy -> Gynecologist
- Child/baby -> Pediatrician
- Kidney/urine -> Nephrologist
- Lung/breathing -> Pulmonologist
- Brain/headache/anxiety -> Neurologist

Available Doctors:
${doctorListText}`;

        // Build alternating history for Gemini
        const validHistory = [];
        const safeHistory = Array.isArray(history)
          ? history.filter(m => m.role === 'user' || m.role === 'model')
          : [];
        safeHistory.forEach(m => {
          if (validHistory.length === 0 || m.role !== validHistory[validHistory.length - 1].role) {
            validHistory.push({ role: m.role, parts: [{ text: m.content || '' }] });
          } else {
            validHistory[validHistory.length - 1].parts[0].text += '\n' + (m.content || '');
          }
        });

        const payload = {
          system_instruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
          contents: [
            ...validHistory,
            { role: 'user', parts: [{ text: message }] }
          ]
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        const data = await response.json();
        if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.json({ reply: data.candidates[0].content.parts[0].text });
        }
        console.warn('Gemini unavailable, using rule-based fallback:', data.error?.message);
      } catch (apiErr) {
        console.warn('Gemini fetch error, using rule-based fallback:', apiErr.message);
      }
    }

    // Rule-based fallback
    const reply = generateLocalReply(message, specialty, matchedDoctors);
    res.json({ reply });

  } catch (error) {
    console.error('Chatbot backend error:', error);
    res.status(500).json({ reply: 'Sorry, I am having trouble connecting. Please try again.' });
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
