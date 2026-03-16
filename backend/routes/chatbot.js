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

// Symptom-to-specialization mapping for internal logic (safety/fallback)
const symptomMap = [
  { keywords: ['fever', 'flu', 'cold', 'body ache'], specialty: 'General Physician' },
  { keywords: ['chest pain', 'heart', 'cardiac'], specialty: 'Cardiologist' },
  { keywords: ['joint pain', 'bone', 'bone fracture'], specialty: 'Orthopedist' },
  { keywords: ['stomach', 'digestion', 'nausea'], specialty: 'Gastroenterologist' },
  { keywords: ['skin', 'rash', 'acne', 'itching'], specialty: 'Dermatologist' },
  { keywords: ['eye', 'vision', 'blur'], specialty: 'Ophthalmologist' },
  { keywords: ['ear', 'nose', 'throat', 'sinus'], specialty: 'ENT Specialist' },
  { keywords: ['diabetes', 'thyroid', 'hormone'], specialty: 'Endocrinologist' },
  { keywords: ['pregnancy', 'women health', 'period'], specialty: 'Gynecologist' },
  { keywords: ['child', 'baby', 'pediatric'], specialty: 'Pediatrician' },
  { keywords: ['kidney', 'urinary'], specialty: 'Nephrologist' },
  { keywords: ['cough', 'breath', 'asthma', 'lung'], specialty: 'Pulmonologist' },
  { keywords: ['headache', 'brain', 'seizure', 'neurology'], specialty: 'Neurologist' },
  { keywords: ['tooth', 'dental', 'gum'], specialty: 'Dentist' },
  { keywords: ['stress', 'mental', 'anxiety'], specialty: 'Psychiatrist' },
];

// POST /api/chatbot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], hospitalId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const allDoctors = await getDoctorsForHospital(hospitalId);
    const doctorContext = allDoctors.length > 0 
      ? allDoctors.map(d => `- Dr. ${d.doctor_name} (${d.specialty_name || 'Specialist'}), ID: ${d.id}`).join('\n')
      : "No doctors currently available in this hospital.";

    const systemPrompt = `You are "Swasthya AI," a professional and empathetic healthcare assistant for a hospital management system.

IDENTITY & ROLE:
- Your name is Swasthya AI.
- You provide general health guidance, symptom explanation, and doctor recommendations.
- You HELP users find available doctors in their hospital.

SAFETY RULES (CRITICAL):
- You ARE NOT a doctor. You DO NOT provide medical diagnoses or prescribe medication.
- Always include a disclaimer if health advice is given: "I am an AI assistant, not a medical professional. Please consult a doctor for a definitive diagnosis."
- For severe symptoms (like "severe chest pain," "difficulty breathing," "heavy bleeding," "unconscious"), immediately flag it as an EMERGENCY and advise seeking urgent medical care.

DOCTOR RECOMMENDATIONS:
- Match user symptoms to the most relevant medical specialty.
- ONLY suggest doctors from the provided list below (real doctors in the system).
- Provide doctor links in markdown format: [Dr. Name](/patient/doctor/ID)
- If a relevant specialty exists but NO doctors are listed, say: "It seems you need a [SPECIALTY], but there are no available doctors for this specialty in your hospital right now."

AVAILABLE DOCTORS IN CURRENT HOSPITAL (ID for linking):
${doctorContext}

SYMPTOM GUIDE FOR YOU:
- Fever/Flu -> General Physician
- Chest Pain -> Cardiologist
- Bone/Joint -> Orthopedist
- Stomach/Digestion -> Gastroenterologist
- Skin/Rash -> Dermatologist
- Eye/Vision -> Ophthalmologist
- Ear/Nose/Throat -> ENT Specialist
- Diabetes/Thyroid -> Endocrinologist
- Pregnancy/Women's Health -> Gynecologist
- Children -> Pediatrician
- Kidney/Urinary -> Nephrologist
- Breathing/Cough -> Pulmonologist
- Brain/Nervous -> Neurologist
- Dental -> Dentist
- Mental Health -> Psychiatrist

RESPONSE STYLE:
- Professional, concise, and helpful.
- Use bullet points for lists.
- Acknowledge symptoms first, then suggest next steps.`;

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
      temperature: 0.5,
      max_completion_tokens: 1024,
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
