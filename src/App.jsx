import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { PatientSidebar, DoctorSidebar, AdminSidebar } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Login = lazy(() => import('./pages/Login'));
const CreateAccountPatient = lazy(() => import('./pages/CreateAccountPatient'));
const DoctorRegister = lazy(() => import('./pages/DoctorRegister'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const CategoriesPage = lazy(() => import('./pages/patient/CategoriesPage'));
const DoctorListing = lazy(() => import('./pages/patient/DoctorListing'));
const Appointments = lazy(() => import('./pages/patient/Appointments'));
const DoctorProfile = lazy(() => import('./pages/patient/DoctorProfile'));
const Reports = lazy(() => import('./pages/patient/Reports'));
const DocumentLocker = lazy(() => import('./pages/patient/DocumentLocker'));

const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorCopilot = lazy(() => import('./pages/doctor/DoctorCopilot'));
const DoctorAnalytics = lazy(() => import('./pages/doctor/DoctorAnalytics'));
const DoctorCalendarPage = lazy(() => import('./pages/doctor/DoctorCalendarPage'));
const DoctorReport = lazy(() => import('./pages/doctor/DoctorReport'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DoctorsManagement = lazy(() => import('./pages/admin/DoctorsManagement'));
const PatientsManagement = lazy(() => import('./pages/admin/PatientsManagement'));
const AppointmentsManagement = lazy(() => import('./pages/admin/AppointmentsManagement'));
const TransactionsManagement = lazy(() => import('./pages/admin/TransactionsManagement'));

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
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="report" element={<DoctorReport />} />
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
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<DoctorsManagement />} />
        <Route path="patients" element={<PatientsManagement />} />
        <Route path="appointments" element={<AppointmentsManagement />} />
        <Route path="transactions" element={<TransactionsManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  </div>
);

const AppShell = () => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const hideNavbar =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/create-account') ||
    location.pathname.startsWith('/register/') ||
    userRole === 'patient';

  return (
    <div className="app-shell">
      {/* Visible top-level UI should render even while routes load */}
      {!hideNavbar && <Navbar />}

      {/* IMPORTANT: Fallback must be visible; do NOT use null here */}
      {/* Replace this fallback with a branded loader if desired */}
      <Suspense
        fallback={
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            App is loading…
          </div>
        }
      >
        {/* If your auth/context needs time to hydrate (e.g., from storage),
            render a visible placeholder instead of returning null. */}
        {/* Example placeholder:
            {isHydrating ? <div>Restoring session…</div> : <Routes>…</Routes>} */}
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
        <Route
          path="/create-account/patient"
          element={
            isAuthenticated ? (
              <Navigate to={`/${userRole}`} replace />
            ) : (
              <main style={{ flex: 1 }}>
                <CreateAccountPatient />
              </main>
            )
          }
        />
        <Route
          path="/register/doctor"
          element={
            isAuthenticated ? (
              <Navigate to={`/${userRole}`} replace />
            ) : (
              <main style={{ flex: 1 }}>
                <DoctorRegister />
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

        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default AppShell;
