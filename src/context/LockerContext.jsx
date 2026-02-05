import React, { createContext, useContext, useState } from 'react';

const LockerContext = createContext(null);

export const LockerProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [documents, setDocuments] = useState([
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
  ]);

  // Mock PIN stored in context
  const CORRECT_PIN = '1234';

  const unlockLocker = () => {
    setIsUnlocked(true);
  };

  const lockLocker = () => {
    setIsUnlocked(false);
  };

  const addDocument = (doc) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const value = {
    isUnlocked,
    unlockLocker,
    lockLocker,
    documents,
    addDocument,
    CORRECT_PIN,
  };

  return <LockerContext.Provider value={value}>{children}</LockerContext.Provider>;
};

export const useLocker = () => {
  const ctx = useContext(LockerContext);
  if (!ctx) {
    throw new Error('useLocker must be used within LockerProvider');
  }
  return ctx;
};
