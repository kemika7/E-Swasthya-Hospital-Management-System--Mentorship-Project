import React, { createContext, useContext, useState } from 'react';

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

  const updateAppointmentDetails = (updates) => {
    setAppointmentDetails((prev) => ({ ...prev, ...updates }));
  };

  const bookAppointment = () => {
    const booked = {
      ...appointmentDetails,
      bookedAt: new Date().toISOString(),
    };
    setLastBookedAppointment(booked);
    return booked;
  };

  const value = {
    appointmentDetails,
    updateAppointmentDetails,
    bookAppointment,
    lastBookedAppointment,
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
