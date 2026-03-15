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
  { keywords: ['fever', 'warm', 'flu', 'temperature', 'chills', 'runny nose', 'sneezing', 'fatigue', 'weakness', 'body ache', 'cold'], specialty: 'General Physician' },
  { keywords: ['chest pain', 'heart pain', 'cardiac', 'cardiology', 'palpitation', 'heart racing', 'irregular heartbeat', 'heart attack'], specialty: 'Cardiologist' },
  { keywords: ['bone pain', 'joint pain', 'knee pain', 'shoulder pain', 'back pain', 'fracture', 'spine', 'ortho', 'arthritis', 'muscle pain'], specialty: 'Orthopedist' },
  { keywords: ['stomach ache', 'stomach pain', 'belly pain', 'digestion', 'gastro', 'nausea', 'vomit', 'diarrhea', 'constipation', 'acidity', 'bloating', 'indigestion', 'abdominal'], specialty: 'Gastroenterologist' },
  { keywords: ['skin rash', 'rash', 'acne', 'eczema', 'dermatology', 'itching', 'skin allergy', 'pimple', 'psoriasis', 'skin problem', 'skin issue'], specialty: 'Dermatologist' },
  { keywords: ['eye pain', 'eye problem', 'vision', 'ophthalmology', 'sight', 'blind', 'retina', 'blur', 'eye infection', 'red eye'], specialty: 'Ophthalmologist' },
  { keywords: ['ear pain', 'nose problem', 'throat pain', 'sore throat', 'ent', 'sinus', 'tonsil', 'hearing loss', 'snoring', 'ear infection', 'nasal'], specialty: 'ENT Specialist' },
  { keywords: ['hormone', 'thyroid', 'diabetes', 'sugar level', 'insulin', 'endocrine', 'weight gain', 'weight loss'], specialty: 'Endocrinologist' },
  { keywords: ['women health', 'pregnancy', 'period pain', 'irregular period', 'gynecology', 'uterus', 'ovary', 'menstrual', 'vaginal', 'pcod', 'pcos'], specialty: 'Gynecologist' },
  { keywords: ['child sick', 'baby sick', 'kid sick', 'pediatric', 'infant', 'toddler', 'my child', 'my baby', 'my kid'], specialty: 'Pediatrician' },
  { keywords: ['kidney pain', 'kidney problem', 'urinary', 'urine problem', 'nephrology', 'bladder', 'kidney stone'], specialty: 'Nephrologist' },
  { keywords: ['cough', 'breathing problem', 'shortness of breath', 'asthma', 'pulmonology', 'respiratory', 'oxygen', 'wheezing', 'lung pain', 'lung problem', 'breathless'], specialty: 'Pulmonologist' },
  { keywords: ['brain problem', 'anxiety', 'depression', 'headache', 'neurology', 'nerve pain', 'seizure', 'migraine', 'dizziness', 'memory loss', 'numbness', 'stroke'], specialty: 'Neurologist' },
  { keywords: ['stress', 'panic attack', 'mood swing', 'bipolar', 'schizophrenia', 'mental health', 'psychiatry', 'suicidal', 'ocd'], specialty: 'Psychiatrist' },
  { keywords: ['tooth pain', 'teeth pain', 'dental', 'gum pain', 'cavity', 'dentist', 'toothache'], specialty: 'Dentist' },
  { keywords: ['blood problem', 'anemia', 'iron deficiency', 'hemoglobin', 'platelet', 'bleeding'], specialty: 'General Physician' },
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
    const spec = (d.specialty_name || 'General Physician').trim();
    if (!grouped[spec]) grouped[spec] = [];
    // keep up to 5 per specialty so Gemini can pick the best 3
    if (grouped[spec].length < 5) {
      grouped[spec].push({ name: d.doctor_name, id: d.id });
    }
  });
  return Object.entries(grouped).map(([spec, docs]) =>
    `${spec}:\n${docs.map((d, i) => `  ${i + 1}. [${d.name}](/patient/doctor/${d.id})`).join('\n')}`
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
    const docList = doctors.map((d, i) => `${i + 1}. [${d.doctor_name}](/patient/doctor/${d.id})`).join('\n');
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
        const systemPrompt = `You are "Swastha AI," a professional, friendly, and knowledgeable virtual health assistant for a patient portal. You behave like a smart medical AI — you can answer any health or general question AND recommend real doctors when needed.

RULES (follow exactly):

1. PATIENT REPORTING SYMPTOMS (e.g. "I have a cough", "I feel feverish", "my stomach hurts"):
   - Respond empathetically. Briefly explain what the condition might be (2-3 sentences max).
   - Then recommend exactly 3 doctors from the available list for the relevant specialty.
   - Format:
     It sounds like you may have [CONDITION]. [1-2 sentence health tip or what to watch for.]
     I recommend consulting a [SPECIALTY]:
     1. [Dr. Name](/patient/doctor/ID)
     2. [Dr. Name](/patient/doctor/ID)
     3. [Dr. Name](/patient/doctor/ID)

2. ASKING ABOUT SYMPTOMS / HEALTH INFO (e.g. "what are symptoms of cough", "what causes stomach ache", "is fever dangerous"):
   - Give a clear, helpful medical explanation. Use a short list if needed.
   - Do NOT recommend doctors unless the user asks.
   - Example for "symptoms of cough":
     Common symptoms associated with a cough include:
     - Dry or wet cough
     - Sore throat or irritation
     - Shortness of breath or wheezing
     - Chest tightness
     - Runny nose or congestion (if due to cold)
     A persistent cough lasting more than 2 weeks should be evaluated by a doctor.

3. SPECIALTY / DOCTOR QUERIES (e.g. "suggest a cardiologist", "which doctor for skin"):
   - Recommend top 3 doctors for that specialty with profile links.

4. GENERAL KNOWLEDGE (science, math, history, tech, etc.):
   - Answer accurately and concisely like a knowledgeable assistant.

5. GREETINGS:
   - Respond: "Hello! I'm Swastha AI. How can I help you today?"

6. CONSTRAINTS:
   - Never use markdown asterisks (*) for bold/italic.
   - Never invent doctor names or IDs. Only use doctors from the list below.
   - If no doctors exist for a specialty: "No doctors are currently available for this specialty. Please contact us directly."
   - Keep responses concise and easy to read.
   - You can use numbered or bulleted lists for clarity.

Symptom to specialty mapping:
- Fever, flu, fatigue, body ache, cold, chills -> General Physician
- Chest pain, heart palpitations, cardiac issues -> Cardiologist
- Bone pain, joint pain, knee, back, fracture, arthritis -> Orthopedist
- Stomach ache, nausea, vomiting, acidity, diarrhea, bloating -> Gastroenterologist
- Skin rash, acne, eczema, itching, psoriasis -> Dermatologist
- Eye pain, vision problems, blur, red eye -> Ophthalmologist
- Ear pain, sore throat, sinus, tonsil, hearing loss -> ENT Specialist
- Diabetes, thyroid, hormones, weight issues -> Endocrinologist
- Pregnancy, periods, PCOS, women's health -> Gynecologist
- Child/baby/infant illness -> Pediatrician
- Kidney pain, urine problems, kidney stones -> Nephrologist
- Cough, breathing difficulty, asthma, wheezing -> Pulmonologist
- Headache, migraine, anxiety, depression, seizure, dizziness -> Neurologist
- Toothache, dental, gum pain -> Dentist
- Stress, panic, mental health, mood disorders -> Psychiatrist

Available Doctors (ONLY use these — never invent):
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
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
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
