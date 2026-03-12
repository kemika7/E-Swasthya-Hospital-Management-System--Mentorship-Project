import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock data imports removed

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
  const [patients, setPatients] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState({
    general: { total: 0, occupied: 0 },
    icu: { total: 0, occupied: 0 },
    private: { total: 0, occupied: 0 },
  });
  const [analytics, setAnalytics] = useState({ labels: [], data: [] });
  const [transactions, setTransactions] = useState([]);
  const [kpis, setKpis] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointmentsToday: 0,
    totalTransactions: 0,
    totalRevenue: 0
  });
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
        setDoctors(data.topDoctors);
        setBeds(data.beds);
        setAnalytics(data.analytics || { labels: [], data: [] });

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
      // Refresh
      const data = await apiFetch('/dashboard/admin');
      setDoctors(data.topDoctors);
      setKpis(data.kpis);
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
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
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
      const patientsData = await apiFetch('/patients');
      setPatients(patientsData);
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
    addPatient,
    analytics
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
