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
  // Dental → General Dentist
  {
    doctorId: 'doc-manoj-thapa',
    name: 'Dr. Manoj Thapa',
    specialization: 'General Dentist',
    category: 'Dental',
    subcategory: 'General Dentist',
    location: 'Kathmandu, Nepal',
    experience: '10 years+',
    patientsCount: '200+',
    reviews: '2k+',
    workingHours: '7:00 AM – 01:45 PM',
    bloodGroup: 'O+',
    dateOfBirth: '18.01.2000',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-ramesh-karki',
    name: 'Dr. Ramesh Karki',
    specialization: 'General Dentist',
    category: 'Dental',
    subcategory: 'General Dentist',
    location: 'Kathmandu, Nepal',
    experience: '12 years+',
    patientsCount: '350+',
    reviews: '2.3k+',
    workingHours: '8:00 AM – 02:00 PM',
    bloodGroup: 'A+',
    dateOfBirth: '12.04.1990',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-suman-shrestha',
    name: 'Dr. Suman Shrestha',
    specialization: 'General Dentist',
    category: 'Dental',
    subcategory: 'General Dentist',
    location: 'Lalitpur, Nepal',
    experience: '9 years+',
    patientsCount: '220+',
    reviews: '1.7k+',
    workingHours: '9:00 AM – 03:00 PM',
    bloodGroup: 'B+',
    dateOfBirth: '22.06.1992',
    image: '/images/doctor1.png',
  },

  // Dental → Orthodontist
  {
    doctorId: 'doc-anisha-poudel',
    name: 'Dr. Anisha Poudel',
    specialization: 'Orthodontist',
    category: 'Dental',
    subcategory: 'Orthodontist',
    location: 'Kathmandu, Nepal',
    experience: '8 years+',
    patientsCount: '300+',
    reviews: '2.1k+',
    workingHours: '10:00 AM – 05:00 PM',
    bloodGroup: 'O-',
    dateOfBirth: '03.03.1993',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-bikash-rana',
    name: 'Dr. Bikash Rana',
    specialization: 'Orthodontist',
    category: 'Dental',
    subcategory: 'Orthodontist',
    location: 'Bhaktapur, Nepal',
    experience: '11 years+',
    patientsCount: '400+',
    reviews: '2.8k+',
    workingHours: '9:00 AM – 04:00 PM',
    bloodGroup: 'AB+',
    dateOfBirth: '19.09.1987',
    image: '/images/doctor1.png',
  },

  // Heart & Blood → Cardiologist
  {
    doctorId: 'doc-prakash-adhikari',
    name: 'Dr. Prakash Adhikari',
    specialization: 'Cardiologist',
    category: 'Heart & Blood',
    subcategory: 'Cardiologist',
    location: 'Kathmandu, Nepal',
    experience: '10 years+',
    patientsCount: '200+',
    reviews: '2k+',
    workingHours: '7:00 AM – 01:45 PM',
    bloodGroup: 'O+',
    dateOfBirth: '18.01.1985',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-nabin-shah',
    name: 'Dr. Nabin Shah',
    specialization: 'Cardiologist',
    category: 'Heart & Blood',
    subcategory: 'Cardiologist',
    location: 'Pokhara, Nepal',
    experience: '12 years+',
    patientsCount: '350+',
    reviews: '2.4k+',
    workingHours: '9:00 AM – 04:00 PM',
    bloodGroup: 'A-',
    dateOfBirth: '25.08.1984',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-sunita-joshi',
    name: 'Dr. Sunita Joshi',
    specialization: 'Cardiologist',
    category: 'Heart & Blood',
    subcategory: 'Cardiologist',
    location: 'Lalitpur, Nepal',
    experience: '9 years+',
    patientsCount: '240+',
    reviews: '1.9k+',
    workingHours: '8:00 AM – 02:00 PM',
    bloodGroup: 'B+',
    dateOfBirth: '10.12.1988',
    image: '/images/doctor1.png',
  },

  // Brain → Neurologist
  {
    doctorId: 'doc-alok-bista',
    name: 'Dr. Alok Bista',
    specialization: 'Neurologist',
    category: 'Brain, Nerves & Mental Health',
    subcategory: 'Neurologist',
    location: 'Kathmandu, Nepal',
    experience: '10 years+',
    patientsCount: '200+',
    reviews: '2k+',
    workingHours: '7:00 AM – 01:45 PM',
    bloodGroup: 'O+',
    dateOfBirth: '18.01.1986',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-meena-acharya',
    name: 'Dr. Meena Acharya',
    specialization: 'Neurologist',
    category: 'Brain, Nerves & Mental Health',
    subcategory: 'Neurologist',
    location: 'Lalitpur, Nepal',
    experience: '11 years+',
    patientsCount: '320+',
    reviews: '2.6k+',
    workingHours: '9:00 AM – 04:00 PM',
    bloodGroup: 'A+',
    dateOfBirth: '22.05.1987',
    image: '/images/doctor1.png',
  },

  // Skin → Dermatologist
  {
    doctorId: 'doc-suresh-maharjan',
    name: 'Dr. Suresh Maharjan',
    specialization: 'Dermatologist',
    category: 'Skin, Hair & Nails',
    subcategory: 'Dermatologist',
    location: 'Kathmandu, Nepal',
    experience: '10 years+',
    patientsCount: '200+',
    reviews: '2k+',
    workingHours: '7:00 AM – 01:45 PM',
    bloodGroup: 'O+',
    dateOfBirth: '18.01.1989',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-kriti-basnet',
    name: 'Dr. Kriti Basnet',
    specialization: 'Dermatologist',
    category: 'Skin, Hair & Nails',
    subcategory: 'Dermatologist',
    location: 'Pokhara, Nepal',
    experience: '8 years+',
    patientsCount: '260+',
    reviews: '2.2k+',
    workingHours: '9:00 AM – 03:00 PM',
    bloodGroup: 'B-',
    dateOfBirth: '12.11.1992',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-pawan-lama',
    name: 'Dr. Pawan Lama',
    specialization: 'Dermatologist',
    category: 'Skin, Hair & Nails',
    subcategory: 'Dermatologist',
    location: 'Bhaktapur, Nepal',
    experience: '12 years+',
    patientsCount: '410+',
    reviews: '3.1k+',
    workingHours: '10:00 AM – 05:00 PM',
    bloodGroup: 'AB-',
    dateOfBirth: '05.06.1985',
    image: '/images/doctor1.png',
  },

  // Children → Pediatrician
  {
    doctorId: 'doc-rina-shrestha',
    name: 'Dr. Rina Shrestha',
    specialization: 'Pediatrician',
    category: 'Children’s Health',
    subcategory: 'Pediatrician',
    location: 'Kathmandu, Nepal',
    experience: '10 years+',
    patientsCount: '200+',
    reviews: '2k+',
    workingHours: '7:00 AM – 01:45 PM',
    bloodGroup: 'O+',
    dateOfBirth: '18.01.1990',
    image: '/images/doctor1.png',
  },
  {
    doctorId: 'doc-sanjay-pandey',
    name: 'Dr. Sanjay Pandey',
    specialization: 'Pediatrician',
    category: 'Children’s Health',
    subcategory: 'Pediatrician',
    location: 'Pokhara, Nepal',
    experience: '9 years+',
    patientsCount: '270+',
    reviews: '2.1k+',
    workingHours: '9:00 AM – 03:00 PM',
    bloodGroup: 'A+',
    dateOfBirth: '30.07.1989',
    image: '/images/doctor1.png',
  },
  
  // Primary Care & General
  {
    doctorId: 'gp-001',
    name: 'Dr. Anil Khadka',
    specialization: 'Acute Illness & General Checkups',
    category: 'Primary Care & General',
    subcategory: 'General Practitioner (GP)',
    location: 'Kathmandu, Nepal',
    experience: '11 years',
    patientsCount: '3,800+',
    reviews: '3.1k',
    workingHours: '8:00 AM – 2:00 PM',
    bloodGroup: 'O+',
    dateOfBirth: '15-02-1983',
    image: '/images/doctors/gp-001.png',
  },
  {
    doctorId: 'fm-001',
    name: 'Dr. Sita Adhikari',
    specialization: 'Family & Preventive Care',
    category: 'Primary Care & General',
    subcategory: 'Family Medicine Physician',
    location: 'Lalitpur, Nepal',
    experience: '9 years',
    patientsCount: '2,600+',
    reviews: '2k',
    workingHours: '9:00 AM – 3:00 PM',
    bloodGroup: 'A+',
    dateOfBirth: '22-06-1987',
    image: '/images/doctors/fm-001.png',
  },
  {
    doctorId: 'im-001',
    name: 'Dr. Roshan Shrestha',
    specialization: 'Adult Chronic Diseases',
    category: 'Primary Care & General',
    subcategory: 'Internal Medicine Physician (Internist)',
    location: 'Bhaktapur, Nepal',
    experience: '13 years',
    patientsCount: '3,200+',
    reviews: '2.7k',
    workingHours: '10:00 AM – 4:00 PM',
    bloodGroup: 'B+',
    dateOfBirth: '09-11-1980',
    image: '/images/doctors/im-001.png',
  },

  // Brain, Nerves & Mental Health
  {
    doctorId: 'ns-001',
    name: 'Dr. Bikram Koirala',
    specialization: 'Brain & Spine Surgery',
    category: 'Brain, Nerves & Mental Health',
    subcategory: 'Neurosurgeon',
    location: 'Kathmandu, Nepal',
    experience: '16 years',
    patientsCount: '1,900+',
    reviews: '1.6k',
    workingHours: '7:30 AM – 1:30 PM',
    bloodGroup: 'O-',
    dateOfBirth: '03-04-1977',
    image: '/images/doctors/ns-001.png',
  },
  {
    doctorId: 'psy-001',
    name: 'Dr. Nirmala Joshi',
    specialization: 'Depression & Anxiety Disorders',
    category: 'Brain, Nerves & Mental Health',
    subcategory: 'Psychiatrist',
    location: 'Pokhara, Nepal',
    experience: '10 years',
    patientsCount: '2,100+',
    reviews: '1.9k',
    workingHours: '11:00 AM – 5:00 PM',
    bloodGroup: 'A-',
    dateOfBirth: '18-08-1985',
    image: '/images/doctors/psy-001.png',
  },
  {
    doctorId: 'psyc-001',
    name: 'Dr. Pradeep Bhandari',
    specialization: 'Behavioral Therapy',
    category: 'Brain, Nerves & Mental Health',
    subcategory: 'Psychologist',
    location: 'Kathmandu, Nepal',
    experience: '8 years',
    patientsCount: '1,700+',
    reviews: '1.4k',
    workingHours: '12:00 PM – 6:00 PM',
    bloodGroup: 'B-',
    dateOfBirth: '27-01-1989',
    image: '/images/doctors/psyc-001.png',
  },

  // Heart & Blood
  {
    doctorId: 'ic-001',
    name: 'Dr. Sanjay Acharya',
    specialization: 'Angioplasty & Stents',
    category: 'Heart & Blood',
    subcategory: 'Interventional Cardiologist',
    location: 'Kathmandu, Nepal',
    experience: '17 years',
    patientsCount: '4,100+',
    reviews: '3.8k',
    workingHours: '8:00 AM – 1:00 PM',
    bloodGroup: 'AB+',
    dateOfBirth: '12-12-1976',
    image: '/images/doctors/ic-001.png',
  },
  {
    doctorId: 'hem-001',
    name: 'Dr. Kabita Rijal',
    specialization: 'Blood Disorders',
    category: 'Heart & Blood',
    subcategory: 'Hematologist',
    location: 'Lalitpur, Nepal',
    experience: '11 years',
    patientsCount: '1,900+',
    reviews: '1.5k',
    workingHours: '10:00 AM – 4:00 PM',
    bloodGroup: 'O+',
    dateOfBirth: '05-05-1984',
    image: '/images/doctors/hem-001.png',
  },

  // Lungs & Breathing
  {
    doctorId: 'pulm-001',
    name: 'Dr. Hari Prasad Neupane',
    specialization: 'Asthma & COPD',
    category: 'Lungs & Breathing',
    subcategory: 'Pulmonologist',
    location: 'Kathmandu, Nepal',
    experience: '14 years',
    patientsCount: '2,800+',
    reviews: '2.3k',
    workingHours: '9:00 AM – 3:00 PM',
    bloodGroup: 'B+',
    dateOfBirth: '20-09-1981',
    image: '/images/doctors/pulm-001.png',
  },

  // Digestive System
  {
    doctorId: 'gas-001',
    name: 'Dr. Raju Ghimire',
    specialization: 'Liver & Digestive Disorders',
    category: 'Digestive System',
    subcategory: 'Gastroenterologist',
    location: 'Pokhara, Nepal',
    experience: '12 years',
    patientsCount: '2,500+',
    reviews: '2k',
    workingHours: '10:00 AM – 4:00 PM',
    bloodGroup: 'O-',
    dateOfBirth: '14-03-1983',
    image: '/images/doctors/gas-001.png',
  },

  // Eyes, Ears, Nose & Throat
  {
    doctorId: 'oph-001',
    name: 'Dr. Sunil Manandhar',
    specialization: 'Cataract & Vision Care',
    category: 'Eyes, Ears, Nose & Throat',
    subcategory: 'Ophthalmologist',
    location: 'Kathmandu, Nepal',
    experience: '15 years',
    patientsCount: '3,600+',
    reviews: '3k',
    workingHours: '8:30 AM – 2:30 PM',
    bloodGroup: 'A+',
    dateOfBirth: '07-07-1979',
    image: '/images/doctors/oph-001.png',
  },

  // Bones, Joints & Muscles
  {
    doctorId: 'ortho-101',
    name: 'Dr. Deepak Shahi',
    specialization: 'Joint Replacement',
    category: 'Bones, Joints & Muscles',
    subcategory: 'Orthopedic Surgeon',
    location: 'Kathmandu, Nepal',
    experience: '18 years',
    patientsCount: '3,900+',
    reviews: '3.4k',
    workingHours: '7:00 AM – 1:00 PM',
    bloodGroup: 'B+',
    dateOfBirth: '01-01-1975',
    image: '/images/doctors/ortho-101.png',
  },

  // Hormones & Metabolism
  {
    doctorId: 'endo-001',
    name: 'Dr. Sharmila Khatri',
    specialization: 'Diabetes & Thyroid',
    category: 'Hormones & Metabolism',
    subcategory: 'Endocrinologist',
    location: 'Lalitpur, Nepal',
    experience: '13 years',
    patientsCount: '2,700+',
    reviews: '2.2k',
    workingHours: '9:30 AM – 3:30 PM',
    bloodGroup: 'O+',
    dateOfBirth: '10-10-1982',
    image: '/images/doctors/endo-001.png',
  },

  // Cancer & Specialized Care
  {
    doctorId: 'onco-001',
    name: 'Dr. Prakash Lamsal',
    specialization: 'Chemotherapy & Cancer Care',
    category: 'Cancer & Specialized Care',
    subcategory: 'Medical Oncologist',
    location: 'Kathmandu, Nepal',
    experience: '16 years',
    patientsCount: '1,800+',
    reviews: '1.6k',
    workingHours: '8:00 AM – 2:00 PM',
    bloodGroup: 'AB-',
    dateOfBirth: '30-06-1978',
    image: '/images/doctors/onco-001.png',
  },

  // Emergency & Hospital Care
  {
    doctorId: 'em-001',
    name: 'Dr. Arjun Rawat',
    specialization: 'Trauma & Acute Care',
    category: 'Emergency & Hospital Care',
    subcategory: 'Emergency Medicine Physician',
    location: 'Kathmandu, Nepal',
    experience: '12 years',
    patientsCount: '4,500+',
    reviews: '3.9k',
    workingHours: 'Rotational Shifts',
    bloodGroup: 'O+',
    dateOfBirth: '25-12-1983',
    image: '/images/doctors/em-001.png',
  },
  
  // Other & Preventive
  {
    doctorId: 'ger-001',
    name: 'Dr. Laxmi Pandey',
    category: 'Other & Preventive',
    subcategory: 'Geriatrician',
    specialization: 'Elderly Care',
    location: 'Bhaktapur, Nepal',
    experience: '14 years',
    patientsCount: '2,200+',
    reviews: '1.8k',
    workingHours: '10:00 AM – 4:00 PM',
    bloodGroup: 'A+',
    dateOfBirth: '16-05-1980',
    image: '/images/doctors/ger-001.png',
  },
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
