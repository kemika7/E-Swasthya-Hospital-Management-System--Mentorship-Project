import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { LockerProvider } from './context/LockerContext';
import { AdminProvider } from './context/AdminContext';
import './styles/global.css';
import ErrorBoundary from './components/ErrorBoundary';
import { GoogleOAuthProvider } from '@react-oauth/google';
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id"}>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <AppointmentProvider>
              <LockerProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </LockerProvider>
            </AppointmentProvider>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
