import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/apiClient';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState({
    general: { total: 50, occupied: 32 },
    icu: { total: 10, occupied: 4 },
    private: { total: 20, occupied: 15 },
  });
  const [analytics, setAnalytics] = useState({ labels: [], data: [] });
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState([]);
  const [kpis, setKpis] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointmentsToday: 0,
    totalTransactions: 0,
    totalRevenue: 0
  });
  const [categories, setCategories] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Actions ---

  const fetchDoctors = async () => {
    try {
      const userProfile = JSON.parse(localStorage.getItem('userProfile'));
      const hospitalId = userProfile?.hospital_id;
      // Use the new /admin/doctors endpoint
      const data = await apiFetch(`/admin/doctors${hospitalId ? `?hospital_id=${hospitalId}` : ''}`);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setDoctors([]);
    }
  };

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      // Fetch Categories, Specializations & Hospitals (Use Admin routes for alignment)
      try {
        const [cats, specs, hosps] = await Promise.all([
          apiFetch('/admin/categories').catch(e => { console.error(e); return []; }),
          apiFetch('/admin/specializations').catch(e => { console.error(e); return []; }),
          apiFetch('/admin/hospitals').catch(e => { console.error(e); return []; })
        ]);
        setCategories(cats || []);
        setSpecialties(specs || []);
        setHospitals(hosps || []);
      } catch (err) {
        console.error('Failed to fetch categories/specializations/hospitals:', err);
      }

      // Fetch Dashboard Stats (Protected route)
      if (isAuthenticated && userRole === 'admin') {
        try {
          const data = await apiFetch('/dashboard/admin');
          if (data) {
            setKpis(data.kpis || {
              totalPatients: 0,
              totalDoctors: 0,
              totalAppointmentsToday: 0,
              totalTransactions: 0,
              totalRevenue: 0
            });
            setAnnouncements(data.announcements || []);
            setAppointments(data.appointments || []);
            if (data.beds) setBeds(data.beds);
            setAnalytics(data.analytics || { labels: [], data: [] });
          }

          const patientsData = await apiFetch('/patients');
          setPatients(Array.isArray(patientsData) ? patientsData : []);

          await fetchDoctors();
        } catch (err) {
          console.error('Failed to initialize admin services:', err);
        }
      }
      setLoading(false);
    };

    fetchAdminData();
  }, [isAuthenticated, userRole]);

  // --- Actions ---

  // Reports
  const fetchReports = async () => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      const data = await apiFetch('/reports');
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const createReportEntry = async (patientId) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/reports/create/${patientId}`, { method: 'POST' });
      fetchReports();
    } catch (err) {
      console.error('Failed to create report entry:', err);
    }
  };

  const updateReportStatus = async (reportId, statusData) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(statusData)
      });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...statusData } : r));
    } catch (err) {
      console.error('Failed to update report status:', err);
    }
  };

  const uploadReportFile = async (reportId, file) => {
    try {
      const formData = new FormData();
      formData.append('report', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reports/upload/${reportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      fetchReports();
    } catch (err) {
      console.error('Failed to upload report file:', err);
    }
  };

  // Doctors
  const addDoctor = async (doctor) => {
    try {
      // Mapping to follow user's naming preference if needed, but backend handles both
      const response = await apiFetch('/admin/add-doctor', {
        method: 'POST',
        body: JSON.stringify(doctor)
      });
      
      if (response && response.error) throw new Error(response.error);

      // Refresh kpis and doctors
      const data = await apiFetch('/dashboard/admin');
      if (data && data.kpis) setKpis(data.kpis);
      await fetchDoctors();
    } catch (err) {
      console.error('Failed to add doctor:', err);
      throw err;
    }
  };

  const updateDoctor = async (id, data) => {
    try {
      await apiFetch(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
      // Optionally refresh dashboard stats if rating/etc changed
      const dashboardData = await apiFetch('/dashboard/admin');
      if (dashboardData && dashboardData.kpis) setKpis(dashboardData.kpis);
    } catch (err) {
      console.error('Failed to update doctor:', err);
      throw err;
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
    categories,
    specialties,
    hospitals,
    loading,
    updatePatient,
    deletePatient,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    addPatient,
    analytics,
    fetchDoctors
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
