import React, { createContext, useContext, useEffect, useState } from 'react';

const AppointmentContext = createContext(null);

export const AppointmentProvider = ({ children }) => {
  const [appointmentDetails, setAppointmentDetails] = useState({
    day: 25,
    month: 12,
    time: '12:45 AM',
    reasonToVisit: 'Follow Up',
    doctorFee: 500,
    total: 500,
    paymentMethod: null, // 'esewa' | 'fonepay'
    phoneNumber: '',
    mpin: '',
  });

  const [lastBookedAppointment, setLastBookedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { apiFetch } = await import('../services/apiClient');
      const data = await apiFetch('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateAppointmentDetails = (updates) => {
    setAppointmentDetails((prev) => ({ ...prev, ...updates }));
  };

  const bookAppointment = async () => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      const payload = {
        doctorId: appointmentDetails.doctorId,
        date: appointmentDetails.date, // Format: YYYY-MM-DD
        time: appointmentDetails.time,
        appointment_type: appointmentDetails.appointmentType || 'Consultation',
        notes: appointmentDetails.reasonToVisit || null,
        duration: appointmentDetails.duration || 30,
      };

      const result = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setLastBookedAppointment(result);
      // Refresh list
      fetchAppointments();
      return result;
    } catch (err) {
      console.error('Failed to book appointment:', err);
      throw err;
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Cancelled' })
      });
      // Refresh list
      fetchAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      throw err;
    }
  };

  const value = {
    appointmentDetails,
    updateAppointmentDetails,
    bookAppointment,
    cancelAppointment,
    lastBookedAppointment,
    appointments,
    loading,
    refreshAppointments: fetchAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) {
    throw new Error('useAppointment must be used within AppointmentProvider');
  }
  return ctx;
};
