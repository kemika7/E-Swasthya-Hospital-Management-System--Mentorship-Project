import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DoctorCalendarPage = () => {
  const { userProfile } = useAuth();
  const doctorName = userProfile?.name || 'Doctor';

  return (
    <div className="layout-main">
      <div className="page-header">
        <h2 className="page-title">Calendar</h2>
      </div>
      <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>
        Welcome, Dr. {doctorName}. Calendar view (placeholder).
      </p>
    </div>
  );
};

export default DoctorCalendarPage;
