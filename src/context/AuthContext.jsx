import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from './HospitalContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { clearHospital } = useHospital();

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [userProfile, setUserProfile] = useState(JSON.parse(localStorage.getItem('userProfile')));

  const login = (userData) => {
    const { token, user } = userData;
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userProfile', JSON.stringify(user));

    setIsAuthenticated(true);
    setUserRole(user.role);
    setUserProfile(user);

    if (user.role === 'patient') navigate('/patient/dashboard');
    if (user.role === 'doctor') navigate('/doctor/dashboard');
    if (user.role === 'admin') navigate('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfile');
    
    // Clear hospital selection on logout to ensure fresh state for next user
    clearHospital();

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

