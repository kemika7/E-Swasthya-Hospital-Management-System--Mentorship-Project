// All mock/static data used by the HMS lives here.

export const specialistCategories = [
  'Neurologist',
  'Dentist',
  'Cardiologist',
  'Psychologist',
  'Dermatologist',
  'Orthopedic',
  'Pediatrician',
  'Ophthalmologist',
];

export const medicalCategories = [
  {
    id: 'primary-care',
    title: 'Primary Care & General',
    icon: 'MdLocalHospital',
    specialties: [
      { id: 'gp', name: 'General Practitioner (GP)' },
      { id: 'family-med', name: 'Family Medicine Physician' },
      { id: 'internal-med', name: 'Internal Medicine Physician (Internist)' },
      { id: 'pcp', name: 'Primary Care Physician' },
      { id: 'preventive', name: 'Preventive Medicine Specialist' }
    ]
  },
  {
    id: 'brain-nerves',
    title: 'Brain, Nerves & Mental Health',
    icon: 'FiActivity',
    specialties: [
      { id: 'neurologist', name: 'Neurologist' },
      { id: 'neurosurgeon', name: 'Neurosurgeon' },
      { id: 'psychiatrist', name: 'Psychiatrist' },
      { id: 'psychologist', name: 'Psychologist' },
      { id: 'child-psych', name: 'Child & Adolescent Psychiatrist' },
      { id: 'behavioral', name: 'Behavioral Medicine Specialist' },
      { id: 'neuropsychiatrist', name: 'Neuropsychiatrist' },
      { id: 'sleep', name: 'Sleep Medicine Specialist' }
    ]
  },
  {
    id: 'heart-blood',
    title: 'Heart & Blood',
    icon: 'FiHeart',
    specialties: [
      { id: 'cardiologist', name: 'Cardiologist' },
      { id: 'interventional-cardio', name: 'Interventional Cardiologist' },
      { id: 'electrophysiologist', name: 'Cardiac Electrophysiologist' },
      { id: 'cardiothoracic', name: 'Cardiothoracic Surgeon' },
      { id: 'vascular', name: 'Vascular Surgeon' },
      { id: 'hematologist', name: 'Hematologist' }
    ]
  },
  {
    id: 'lungs-breathing',
    title: 'Lungs & Breathing',
    icon: 'FaLungs',
    specialties: [
      { id: 'pulmonologist', name: 'Pulmonologist' },
      { id: 'critical-care', name: 'Critical Care Specialist (Intensivist)' },
      { id: 'respiratory', name: 'Respiratory Medicine Specialist' },
      { id: 'sleep-apnea', name: 'Sleep Apnea Specialist' }
    ]
  },
  {
    id: 'digestive',
    title: 'Digestive System',
    icon: 'GiStomach',
    specialties: [
      { id: 'gastroenterologist', name: 'Gastroenterologist' },
      { id: 'hepatologist', name: 'Hepatologist' },
      { id: 'colorectal', name: 'Colorectal Surgeon' },
      { id: 'bariatric', name: 'Bariatric Surgeon' }
    ]
  },
  {
    id: 'skin-hair',
    title: 'Skin, Hair & Nails',
    icon: 'FiUser',
    specialties: [
      { id: 'dermatologist', name: 'Dermatologist' },
      { id: 'dermatopathologist', name: 'Dermatopathologist' },
      { id: 'cosmetic-derm', name: 'Cosmetic Dermatologist' },
      { id: 'trichologist', name: 'Trichologist' }
    ]
  },
  {
    id: 'ent',
    title: 'Eyes, Ears, Nose & Throat',
    icon: 'FiEye',
    specialties: [
      { id: 'ophthalmologist', name: 'Ophthalmologist' },
      { id: 'optometrist', name: 'Optometrist' },
      { id: 'ent', name: 'ENT Specialist' },
      { id: 'audiologist', name: 'Audiologist' }
    ]
  },
  {
    id: 'bones-joints',
    title: 'Bones, Joints & Muscles',
    icon: 'FaBone',
    specialties: [
      { id: 'orthopedic', name: 'Orthopedic Surgeon' },
      { id: 'rheumatologist', name: 'Rheumatologist' },
      { id: 'sports-med', name: 'Sports Medicine Doctor' },
      { id: 'pmr', name: 'Physical Medicine & Rehabilitation' },
      { id: 'chiropractor', name: 'Chiropractor' },
      { id: 'osteopathic', name: 'Osteopathic Physician' }
    ]
  },
  {
    id: 'hormones',
    title: 'Hormones & Metabolism',
    icon: 'MdBloodtype',
    specialties: [
      { id: 'endocrinologist', name: 'Endocrinologist' },
      { id: 'diabetologist', name: 'Diabetologist' },
      { id: 'metabolic', name: 'Metabolic Specialist' }
    ]
  },
  {
    id: 'kidneys',
    title: 'Kidneys & Urinary System',
    icon: 'FaSyringe', // Fallback or find better
    specialties: [
      { id: 'nephrologist', name: 'Nephrologist' },
      { id: 'urologist', name: 'Urologist' },
      { id: 'urogynecologist', name: 'Urogynecologist' }
    ]
  },
  {
    id: 'womens-health',
    title: 'Women’s Health',
    icon: 'FaFemale',
    specialties: [
      { id: 'gynecologist', name: 'Gynecologist' },
      { id: 'obstetrician', name: 'Obstetrician' },
      { id: 'ob-gyn', name: 'OB-GYN' },
      { id: 'reproductive-endo', name: 'Reproductive Endocrinologist' },
      { id: 'mfm', name: 'Maternal–Fetal Medicine Specialist' }
    ]
  },
  {
    id: 'childrens-health',
    title: 'Children’s Health',
    icon: 'MdChildCare',
    specialties: [
      { id: 'pediatrician', name: 'Pediatrician' },
      { id: 'pediatric-specialist', name: 'Pediatric Specialist' },
      { id: 'neonatologist', name: 'Neonatologist' },
      { id: 'pediatric-cardio', name: 'Pediatric Cardiologist' },
      { id: 'pediatric-neuro', name: 'Pediatric Neurologist' },
      { id: 'pediatric-surgeon', name: 'Pediatric Surgeon' }
    ]
  },
  {
    id: 'cancer',
    title: 'Cancer & Specialized Care',
    icon: 'FaRibbon',
    specialties: [
      { id: 'medical-oncologist', name: 'Medical Oncologist' },
      { id: 'radiation-oncologist', name: 'Radiation Oncologist' },
      { id: 'surgical-oncologist', name: 'Surgical Oncologist' },
      { id: 'hem-onc', name: 'Hematology-Oncologist' },
      { id: 'palliative', name: 'Palliative Care Specialist' }
    ]
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics & Imaging',
    icon: 'FaXRay',
    specialties: [
      { id: 'radiologist', name: 'Radiologist' },
      { id: 'interventional-rad', name: 'Interventional Radiologist' },
      { id: 'nuclear-med', name: 'Nuclear Medicine Specialist' },
      { id: 'pathologist', name: 'Pathologist' },
      { id: 'clinical-path', name: 'Clinical Pathologist' }
    ]
  },
  {
    id: 'infectious',
    title: 'Infectious & Immune System',
    icon: 'FaViruses',
    specialties: [
      { id: 'infectious-disease', name: 'Infectious Disease Specialist' },
      { id: 'immunologist', name: 'Immunologist' },
      { id: 'allergist', name: 'Allergist' },
      { id: 'clinical-immuno', name: 'Clinical Immunologist' }
    ]
  },
  {
    id: 'pain',
    title: 'Pain & Anesthesia',
    icon: 'FaProcedures',
    specialties: [
      { id: 'anesthesiologist', name: 'Anesthesiologist' },
      { id: 'pain-mgmt', name: 'Pain Management Specialist' },
      { id: 'palliative-med', name: 'Palliative Medicine Doctor' }
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency & Hospital Care',
    icon: 'FaAmbulance',
    specialties: [
      { id: 'emergency-med', name: 'Emergency Medicine Physician' },
      { id: 'trauma-surgeon', name: 'Trauma Surgeon' },
      { id: 'hospitalist', name: 'Hospitalist' },
      { id: 'critical-care-phys', name: 'Critical Care Physician' }
    ]
  },
  {
    id: 'dental',
    title: 'Dental',
    icon: 'FaTooth',
    specialties: [
      { id: 'general-dentist', name: 'General Dentist' },
      { id: 'orthodontist', name: 'Orthodontist' },
      { id: 'periodontist', name: 'Periodontist' },
      { id: 'endodontist', name: 'Endodontist' },
      { id: 'oral-surgeon', name: 'Oral & Maxillofacial Surgeon' },
      { id: 'prosthodontist', name: 'Prosthodontist' },
      { id: 'pediatric-dentist', name: 'Pediatric Dentist' }
    ]
  },
  {
    id: 'other',
    title: 'Other & Preventive',
    icon: 'FaNotesMedical',
    specialties: [
      { id: 'geriatrician', name: 'Geriatrician' },
      { id: 'occupational-med', name: 'Occupational Medicine Physician' },
      { id: 'public-health', name: 'Public Health Specialist' },
      { id: 'travel-med', name: 'Travel Medicine Specialist' },
      { id: 'lifestyle-med', name: 'Lifestyle Medicine Physician' },
      { id: 'sexual-health', name: 'Sexual Health Specialist' }
    ]
  }
];

export const doctors = [
  {
    id: 1,
    name: 'Dr. Maya Sharma',
    specialty: 'Cardiologist',
    categoryId: 'heart-blood',
    experience: '12 years',
    rating: 4.8,
    nextAvailable: 'Today, 4:30 PM',
  },
  {
    id: 2,
    name: 'Dr. Arjun Mehta',
    specialty: 'Neurologist',
    categoryId: 'brain-nerves',
    experience: '9 years',
    rating: 4.6,
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
  {
    id: 3,
    name: 'Dr. Riya Patel',
    specialty: 'Dermatologist',
    categoryId: 'skin-hair',
    experience: '7 years',
    rating: 4.7,
    nextAvailable: 'Fri, 2:00 PM',
  },
  {
    id: 4,
    name: 'Dr. Sanjay Gupta',
    specialty: 'General Dentist',
    categoryId: 'dental',
    experience: '15 years',
    rating: 4.9,
    nextAvailable: 'Today, 2:00 PM',
  },
  {
    id: 5,
    name: 'Dr. Priya Singh',
    specialty: 'Pediatrician',
    categoryId: 'childrens-health',
    experience: '5 years',
    rating: 4.5,
    nextAvailable: 'Tomorrow, 9:00 AM',
  },
  {
    id: 6,
    name: 'Dr. Ankit Verma',
    specialty: 'Orthopedic Surgeon',
    categoryId: 'bones-joints',
    experience: '11 years',
    rating: 4.7,
    nextAvailable: 'Thu, 11:30 AM',
  },
  {
    id: 7,
    name: 'Dr. Neha Kapoor',
    specialty: 'Gynecologist',
    categoryId: 'womens-health',
    experience: '8 years',
    rating: 4.8,
    nextAvailable: 'Fri, 10:00 AM',
  },
  {
    id: 8,
    name: 'Dr. Vikram Malhotra',
    specialty: 'Psychiatrist',
    categoryId: 'brain-nerves',
    experience: '14 years',
    rating: 4.9,
    nextAvailable: 'Today, 5:00 PM',
  },
  {
    id: 9,
    name: 'Dr. Suresh Reddy',
    specialty: 'Gastroenterologist',
    categoryId: 'digestive',
    experience: '18 years',
    rating: 4.8,
    nextAvailable: 'Mon, 11:00 AM',
  },
  {
    id: 10,
    name: 'Dr. Amit Joshi',
    specialty: 'Ophthalmologist',
    categoryId: 'ent',
    experience: '6 years',
    rating: 4.6,
    nextAvailable: 'Wed, 3:00 PM',
  }
];

export const upcomingAppointment = {
  doctorName: 'Dr. Manoj Thapa',
  specialty: 'Dentist',
  date: 'December 28',
  time: '12:30 PM',
  location: 'Dentistry, Block A - Room 101',
};

export const appointmentReasons = [
  'Routine Check-up',
  'Follow-up Visit',
  'Prescription Renewal',
  'Lab Report Discussion',
  'Other',
];

export const sampleAppointmentsForDoctor = [
  {
    id: 1,
    patientName: 'Aarav Khanna',
    time: '09:00 AM',
    reason: 'Routine Check-up',
  },
  {
    id: 2,
    patientName: 'Sara Khan',
    time: '09:45 AM',
    reason: 'Lab Report Discussion',
  },
  {
    id: 3,
    patientName: 'Vikram Singh',
    time: '10:30 AM',
    reason: 'Follow-up Visit',
  },
];

export const doctorPatients = [
  {
    id: 1,
    name: 'Aarav Khanna',
    age: 34,
    condition: 'Hypertension',
    lastVisit: '2026-01-26',
  },
  {
    id: 2,
    name: 'Sara Khan',
    age: 28,
    condition: 'Arrhythmia',
    lastVisit: '2026-01-20',
  },
  {
    id: 3,
    name: 'Vikram Singh',
    age: 46,
    condition: 'Post-surgery follow-up',
    lastVisit: '2026-01-18',
  },
];

export const reportStatusSteps = ['Uploaded', 'Processing', 'Completed'];

export const reports = [
  {
    id: 1,
    name: 'Complete Blood Count',
    status: 'Completed',
    requestedOn: '2026-01-20',
  },
  {
    id: 2,
    name: 'Lipid Profile',
    status: 'Processing',
    requestedOn: '2026-01-25',
  },
  {
    id: 3,
    name: 'ECG',
    status: 'Uploaded',
    requestedOn: '2026-01-27',
  },
];

export const lockerDocuments = [
  {
    id: 1,
    name: 'Discharge Summary - Jan 2026.pdf',
    uploadedOn: '2026-01-28',
    size: '1.2 MB',
  },
  {
    id: 2,
    name: 'Insurance Policy.pdf',
    uploadedOn: '2025-12-14',
    size: '800 KB',
  },
];

// Simple 4-digit MPIN for the digital locker (for demo only)
export const lockerMpin = '1234';

export const adminKpis = {
  totalPatients: 1240,
  totalDoctors: 72,
  totalAppointmentsToday: 58,
  totalRevenue: '45,200',
  totalTransactions: 142
};

export const adminAnnouncements = [
  {
    id: 1,
    title: 'New ICU Wing Opening',
    body: 'The new 20-bed ICU wing will be operational from 10th Feb.',
    date: '2026-02-01',
  },
  {
    id: 2,
    title: 'Accreditation Audit',
    body: 'NABH accreditation audit scheduled between 15th - 18th Feb.',
    date: '2026-01-30',
  },
];

// Chart.js mock data
export const doctorAnalyticsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  appointments: [8, 10, 9, 7, 11, 5],
};

export const adminAnalyticsData = {
  labels: ['OPD', 'IPD', 'Emergency', 'Teleconsult'],
  patientCounts: [420, 180, 95, 60],
};
