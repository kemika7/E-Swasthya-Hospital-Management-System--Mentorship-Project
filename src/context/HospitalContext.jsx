import React, { createContext, useContext, useState, useCallback } from 'react';

const HospitalContext = createContext(null);

const STORAGE_KEY = 'selectedHospital';

const readFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const HospitalProvider = ({ children }) => {
  const [selectedHospital, setSelectedHospitalState] = useState(readFromStorage);

  const setSelectedHospital = useCallback((hospital) => {
    setSelectedHospitalState(hospital);
    if (hospital) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hospital));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearHospital = useCallback(() => {
    setSelectedHospitalState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <HospitalContext.Provider value={{ selectedHospital, setSelectedHospital, clearHospital }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const ctx = useContext(HospitalContext);
  if (!ctx) {
    throw new Error('useHospital must be used within HospitalProvider');
  }
  return ctx;
};
