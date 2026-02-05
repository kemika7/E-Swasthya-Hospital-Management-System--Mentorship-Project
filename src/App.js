import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { PatientSidebar, DoctorSidebar, AdminSidebar } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';

import PatientDashboard from './pages/patient/PatientDashboard';
import CategoriesPage from './pages/patient/CategoriesPage';
import DoctorListing from './pages/patient/DoctorListing';
import Appointments from './pages/patient/Appointments';
import Reports from './pages/patient/Reports';
import DocumentLocker from './pages/patient/DocumentLocker';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorCopilot from './pages/doctor/DoctorCopilot';

import AdminDashboard from './pages/admin/AdminDashboard';

const PatientLayout = () => (
  <div className="app-content">
    <PatientSidebar />
    <div style={{ flex: 1 }}>
      <Routes>
        <Route index element={<PatientDashboard />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="doctors" element={<CategoriesPage />} />
        <Route path="category/:categoryId" element={<DoctorListing />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="locker" element={<DocumentLocker />} />
        <Route path="*" element={<Navigate to="/patient" replace />} />
      </Routes>
    </div>
  </div>
);

const DoctorLayout = () => (
  <div className="app-content">
    <DoctorSidebar />
    <div style={{ flex: 1 }}>
      <Routes>
        <Route index element={<DoctorDashboard />} />
        <Route path="copilot" element={<DoctorCopilot />} />
        <Route path="*" element={<Navigate to="/doctor" replace />} />
      </Routes>
    </div>
  </div>
);

const AdminLayout = () => (
  <div className="app-content">
    <AdminSidebar />
    <div style={{ flex: 1 }}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  </div>
);

const AppShell = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={`/${userRole}`} replace />
            ) : (
              <main style={{ flex: 1 }}>
                <Login />
              </main>
            )
          }
        />

        {/* Patient Portal */}
        <Route
          path="/patient/*"
          element={
            <ProtectedRoute role="patient">
              <PatientLayout />
            </ProtectedRoute>
          }
        />

        {/* Doctor Portal */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          }
        />

        {/* Admin Portal */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default AppShell;

