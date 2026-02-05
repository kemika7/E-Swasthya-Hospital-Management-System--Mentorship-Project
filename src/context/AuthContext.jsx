import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'patient' | 'doctor' | 'admin'
  const [userProfile, setUserProfile] = useState(null);

  const login = ({ name, email, role }) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserProfile({ name, email, role });

    if (role === 'patient') navigate('/patient/dashboard');
    if (role === 'doctor') navigate('/doctor/dashboard');
    if (role === 'admin') navigate('/admin/dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserProfile(null);
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    userRole,
    userProfile,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

