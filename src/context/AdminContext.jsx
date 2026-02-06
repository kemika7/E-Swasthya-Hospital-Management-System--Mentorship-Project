import React, { createContext, useContext, useState } from 'react';
import { 
  doctors as initialDoctors, 
  doctorPatients as initialPatients, 
  adminAnnouncements as initialAnnouncements,
  adminKpis as initialKpis
} from '../data/mockData';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  // --- State Initialization ---
  const [doctors, setDoctors] = useState(initialDoctors);
  const [patients, setPatients] = useState(initialPatients.map(p => ({
    ...p,
    room: Math.floor(Math.random() * 100) + 100,
    ward: ['General', 'Private', 'ICU'][Math.floor(Math.random() * 3)],
    status: 'Admitted'
  })));
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [appointments, setAppointments] = useState([
    // Mocking some appointments for admin view since mockData might be limited
    { id: 1, patientName: 'Aarav Khanna', doctorName: 'Dr. Maya Sharma', date: '2026-02-10', time: '09:00 AM', status: 'Scheduled', type: 'Check-up' },
    { id: 2, patientName: 'Sara Khan', doctorName: 'Dr. Arjun Mehta', date: '2026-02-11', time: '10:30 AM', status: 'Completed', type: 'Consultation' },
    { id: 3, patientName: 'Vikram Singh', doctorName: 'Dr. Riya Patel', date: '2026-02-12', time: '02:00 PM', status: 'Pending', type: 'Follow-up' },
  ]);
  const [beds, setBeds] = useState({
    general: { total: 50, occupied: 32 },
    icu: { total: 10, occupied: 4 },
    private: { total: 20, occupied: 15 },
  });

  const [transactions, setTransactions] = useState([
    { id: 1, patient: 'Aarav Khanna', amount: 150, date: '2026-02-10', status: 'Completed', method: 'Credit Card' },
    { id: 2, patient: 'Sara Khan', amount: 75, date: '2026-02-11', status: 'Pending', method: 'Insurance' },
    { id: 3, patient: 'Vikram Singh', amount: 500, date: '2026-02-09', status: 'Completed', method: 'Cash' },
    { id: 4, patient: 'Rohan Gupta', amount: 200, date: '2026-02-12', status: 'Failed', method: 'Online Transfer' },
  ]);

  // --- Actions ---

  // Doctors
  const addDoctor = (doctor) => {
    setDoctors([...doctors, doctor]);
  };

  const updateDoctor = (doctorId, updatedData) => {
    setDoctors(doctors.map(doc => doc.doctorId === doctorId ? { ...doc, ...updatedData } : doc));
  };

  const deleteDoctor = (doctorId) => {
    setDoctors(doctors.filter(doc => doc.doctorId !== doctorId));
  };

  // Patients
  const addPatient = (patient) => {
    const newPatient = { ...patient, id: Date.now() };
    setPatients([...patients, newPatient]);
  };

  const updatePatient = (id, updatedData) => {
    setPatients(patients.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deletePatient = (id) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  // Appointments
  const updateAppointment = (id, updatedData) => {
    setAppointments(appointments.map(app => app.id === id ? { ...app, ...updatedData } : app));
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter(app => app.id !== id));
  };

  // Announcements
  const addAnnouncement = (announcement) => {
    const newAnnouncement = { 
      ...announcement, 
      id: Date.now(), 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    };
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  // Bed Management
  const updateBedCapacity = (type, change) => { // change can be { total: 55, occupied: 30 }
    setBeds(prev => ({
      ...prev,
      [type]: { ...prev[type], ...change }
    }));
  };

  // Transactions
  const updateTransaction = (id, updatedData) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  // KPIs (Derived)
  const kpis = {
    totalDoctors: doctors.length,
    totalPatients: patients.length,
    totalAppointmentsToday: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length || 12, // fallback for demo
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((acc, curr) => curr.status === 'Completed' ? acc + curr.amount : acc, 0),
    ...initialKpis // keep other static kpis if needed
  };

  const value = {
    doctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    appointments,
    updateAppointment,
    deleteAppointment,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    beds,
    updateBedCapacity,
    transactions,
    updateTransaction,
    kpis
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
