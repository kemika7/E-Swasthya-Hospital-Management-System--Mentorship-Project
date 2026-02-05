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

export const doctors = [
  {
    id: 1,
    name: 'Dr. Maya Sharma',
    specialty: 'Cardiologist',
    experience: '12 years',
    rating: 4.8,
    nextAvailable: 'Today, 4:30 PM',
  },
  {
    id: 2,
    name: 'Dr. Arjun Mehta',
    specialty: 'Neurologist',
    experience: '9 years',
    rating: 4.6,
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
  {
    id: 3,
    name: 'Dr. Riya Patel',
    specialty: 'Dermatologist',
    experience: '7 years',
    rating: 4.7,
    nextAvailable: 'Fri, 2:00 PM',
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

