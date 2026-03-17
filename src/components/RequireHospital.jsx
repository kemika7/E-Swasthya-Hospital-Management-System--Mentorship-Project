import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';

const RequireHospital = ({ children }) => {
  const { selectedHospital } = useHospital();
  const location = useLocation();

  if (!selectedHospital) {
    // Redirect them to the select-hospital page, but save the current location they
    // were trying to go to. This allows us to send them there after they login,
    // which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/patient/select-hospital" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireHospital;
