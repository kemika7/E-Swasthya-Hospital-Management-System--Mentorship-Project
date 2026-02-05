import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { PatientSidebar, DoctorSidebar, AdminSidebar } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';

// Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';

import PatientDashboard from './pages/patient/PatientDashboard';
import CategoriesPage from './pages/patient/CategoriesPage';
import DoctorListing from './pages/patient/DoctorListing';
import Appointments from './pages/patient/Appointments';
import DoctorProfile from './pages/patient/DoctorProfile';
import Reports from './pages/patient/Reports';
import DocumentLocker from './pages/patient/DocumentLocker';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorCopilot from './pages/doctor/DoctorCopilot';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';
import DoctorCalendarPage from './pages/doctor/DoctorCalendarPage';
import DoctorReport from './pages/doctor/DoctorReport';

import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorsManagement from './pages/admin/DoctorsManagement';
import PatientsManagement from './pages/admin/PatientsManagement';
import AppointmentsManagement from './pages/admin/AppointmentsManagement';
import TransactionsManagement from './pages/admin/TransactionsManagement';

const PatientLayout = () => (
  <div style={{ width: '100%' }}>
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
);

const DoctorLayout = () => (
  <div className="app-content">
    <DoctorSidebar />
    <div style={{ flex: 1 }}>
      <Routes>
        <Route index element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="analytics" element={<DoctorAnalytics />} />
        <Route path="calendar" element={<DoctorCalendarPage />} />
        <Route path="report" element={<DoctorReport />} />
        <Route path="copilot" element={<DoctorCopilot />} />
        <Route path="*" element={<Navigate to="/doctor" replace />} />
      </Routes>
    </div>
  </div>
);

const AdminLayout = () => (
  <AdminProvider>
    <div className="app-content">
      <AdminSidebar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doctors" element={<DoctorsManagement />} />
          <Route path="patients" element={<PatientsManagement />} />
          <Route path="appointments" element={<AppointmentsManagement />} />
          <Route path="transactions" element={<TransactionsManagement />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  </AdminProvider>
);

const AppShell = () => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const hideNavbar = location.pathname === '/' || location.pathname === '/login' || userRole === 'patient';

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
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

        {/* Global Doctor and Appointment routes */}
        <Route
          path="/doctors/:doctorId"
          element={
            <ProtectedRoute role="patient">
              <DoctorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute role="patient">
              <Appointments />
            </ProtectedRoute>
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
