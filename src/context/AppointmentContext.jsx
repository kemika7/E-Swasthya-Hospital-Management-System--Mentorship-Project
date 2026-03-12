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

  const bookAppointment = async (details = null) => {
    try {
      const { apiFetch } = await import('../services/apiClient');

      const source = details || appointmentDetails;
      const payload = {
        doctorId: source.doctorId,
        date: source.date, // Format: YYYY-MM-DD
        time: source.time,
        appointment_type: source.appointmentType || 'Consultation',
        notes: source.reasonToVisit || null,
        duration: source.duration || 30,
      };

      console.log('Context: Booking appointment with payload:', payload);

      const result = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setLastBookedAppointment(result);
      // Refresh list
      await fetchAppointments();
      return result;
    } catch (err) {
      console.error('Context: Failed to book appointment:', err);
      throw err;
    }
  };

  const updateAppointment = async (appointmentId, data) => {
    try {
      console.log('Context: Updating appointment:', appointmentId, data);
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch(`/appointments/${Number(appointmentId)}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await fetchAppointments();
    } catch (err) {
      console.error('Failed to update appointment:', err);
      throw err;
    }
  };

  const cancelAppointment = async (appointmentId) => {
    return updateAppointment(appointmentId, { status: 'Cancelled' });
  };

  const value = {
    appointmentDetails,
    updateAppointmentDetails,
    bookAppointment,
    updateAppointment,
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
