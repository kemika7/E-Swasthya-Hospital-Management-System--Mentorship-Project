import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role, children }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    // If user is authenticated but not allowed for this route,
    // redirect them to their own dashboard.
    if (userRole === 'patient') return <Navigate to="/patient" replace />;
    if (userRole === 'doctor') return <Navigate to="/doctor" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;

