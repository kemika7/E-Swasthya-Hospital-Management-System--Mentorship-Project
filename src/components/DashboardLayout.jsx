import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { PatientSidebar, DoctorSidebar, AdminSidebar } from './Sidebar';
import SwasthyaAI from './SwasthyaAI';

const DashboardLayout = ({ children }) => {
  const { userRole } = useAuth();

  const renderSidebar = () => {
    switch (userRole) {
      case 'patient':
        return <PatientSidebar />;
      case 'doctor':
        return <DoctorSidebar />;
      case 'admin':
        return <AdminSidebar />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-root">
      {renderSidebar()}
      <div className="dashboard-container">
        <Navbar />
        <main className="dashboard-main">
          <div className="layout-main">
            {children}
          </div>
        </main>
      </div>
      {userRole === 'patient' && <SwasthyaAI />}
    </div>
  );
};

export default DashboardLayout;
