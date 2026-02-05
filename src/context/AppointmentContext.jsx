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

  useEffect(() => {
    const persisted = localStorage.getItem('appointments');
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) {
          setAppointments(parsed);
        }
      } catch {}
    }
  }, []);

  const updateAppointmentDetails = (updates) => {
    setAppointmentDetails((prev) => ({ ...prev, ...updates }));
  };

  const bookAppointment = () => {
    const booked = {
      doctorId: appointmentDetails.doctorId,
      doctorName: appointmentDetails.doctorName,
      specialty: appointmentDetails.specialty,
      date: appointmentDetails.date,
      time: appointmentDetails.time,
      status: appointmentDetails.status || 'Upcoming',
      location: appointmentDetails.location,
      bookedAt: new Date().toISOString(),
    };
    setLastBookedAppointment(booked);
    const next = [booked, ...appointments];
    setAppointments(next);
    try {
      localStorage.setItem('appointments', JSON.stringify(next));
    } catch {}
    return booked;
  };

  const value = {
    appointmentDetails,
    updateAppointmentDetails,
    bookAppointment,
    lastBookedAppointment,
    appointments,
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
