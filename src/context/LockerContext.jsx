import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/apiClient';

const LockerContext = createContext(null);

export const LockerProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasSetPin, setHasSetPin] = useState(null); // null = unknown yet
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await apiFetch('/locker/status');
      setHasSetPin(data.hasSetPin);
    } catch (err) {
      console.error('Failed to check locker status:', err);
      // Assume no pin if error, or user not logged in yet
      setHasSetPin(false);
    }
  };

  const setupPin = async (mpin) => {
    await apiFetch('/locker/setup-pin', {
      method: 'POST',
      body: JSON.stringify({ mpin })
    });
    setHasSetPin(true);
    setIsUnlocked(true);
  };

  const verifyPin = async (mpin) => {
    await apiFetch('/locker/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ mpin })
    });
    setIsUnlocked(true);
    fetchDocuments();
  };

  const lockLocker = () => {
    setIsUnlocked(false);
    setDocuments([]);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/locker/documents');
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    
    // apiFetch expects JSON by default unless FormData is passed. 
    // Wait, apiFetch typically uses JSON stringify if body is an object.
    // Let's ensure apiFetch can handle FormData. 
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/locker/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Do NOT set Content-Type to application/json, browser will set multipart/form-data with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Upload failed');
    }

    const data = await response.json();
    setDocuments((prev) => [data.document, ...prev]);
  };

  const deleteDocument = async (id) => {
    await apiFetch(`/locker/documents/${id}`, { method: 'DELETE' });
    setDocuments((prev) => prev.filter(d => d.id !== id));
  };

  const value = {
    isUnlocked,
    hasSetPin,
    documents,
    loading,
    checkStatus,
    setupPin,
    verifyPin,
    lockLocker,
    fetchDocuments,
    addDocument,
    deleteDocument,
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
