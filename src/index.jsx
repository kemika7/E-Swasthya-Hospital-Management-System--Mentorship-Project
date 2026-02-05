import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { LockerProvider } from './context/LockerContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppointmentProvider>
          <LockerProvider>
            <App />
          </LockerProvider>
        </AppointmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

