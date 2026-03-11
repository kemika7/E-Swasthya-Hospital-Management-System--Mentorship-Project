import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]); // This would need its own API or be part of dashboard
  const [announcements, setAnnouncements] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState({
    general: { total: 50, occupied: 32 },
    icu: { total: 10, occupied: 4 },
    private: { total: 20, occupied: 15 },
  });
  const [transactions, setTransactions] = useState([]);
  const [kpis, setKpis] = useState(initialKpis);
  const [loading, setLoading] = useState(true);

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { apiFetch } = await import('../services/apiClient');
        const data = await apiFetch('/dashboard/admin');
        setKpis(data.kpis);
        setAnnouncements(data.announcements);
        setAppointments(data.appointments);
        // doctors list might need its own mapping if we want full objects
        setDoctors(data.topDoctors);
        setBeds(data.beds);

        // Fetch all patients for management
        const patientsData = await apiFetch('/patients');
        setPatients(patientsData);
      } catch (err) {
        console.error('Failed to fetch admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // --- Actions ---

  // Doctors
  const addDoctor = async (doctor) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/doctors', {
        method: 'POST',
        body: JSON.stringify(doctor)
      });
      // Refresh doctors list if we had one, or just refresh dashboard
    } catch (err) {
      console.error('Failed to add doctor:', err);
    }
  };

  const updateDoctor = async (id, data) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Failed to update doctor:', err);
    }
  };

  const deleteDoctor = async (id) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/doctors/${id}`, { method: 'DELETE' });
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete doctor:', err);
    }
  };

  // Patients
  const addPatient = async (patient) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/patients', {
        method: 'POST',
        body: JSON.stringify(patient)
      });
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  const updatePatient = async (id, updatedData) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    } catch (err) {
      console.error('Failed to update patient:', err);
    }
  };

  const deletePatient = async (id) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/patients/${id}`, { method: 'DELETE' });
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete patient:', err);
    }
  };

  // Appointments
  const addAppointment = async (appointmentData) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
      // Refresh
      const data = await apiFetch('/dashboard/admin');
      setAppointments(data.appointments);
      setKpis(data.kpis);
    } catch (err) {
      console.error('Failed to add appointment:', err);
    }
  };

  const updateAppointment = async (id, updatedData) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, ...updatedData } : app));
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/appointments/${id}`, { method: 'DELETE' });
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  };

  // Announcements
  const addAnnouncement = async (announcement) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/announcements', {
        method: 'POST',
        body: JSON.stringify(announcement)
      });
      const data = await apiFetch('/dashboard/admin');
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error('Failed to add announcement:', err);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  // Bed Management
  const updateBedCapacity = (type, change) => {
    setBeds(prev => ({
      ...prev,
      [type]: { ...prev[type], ...change }
    }));
  };

  const value = {
    doctors,
    patients,
    appointments,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    beds,
    updateBedCapacity,
    transactions,
    kpis,
    loading,
    updatePatient,
    deletePatient,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    addPatient
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
