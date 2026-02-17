import React from 'react';
import { Link } from 'react-router-dom';

// Minimal App replacement to diagnose white screen root causes.
// HOW TO USE:
// 1) Temporarily change the import in src/index.jsx from:
//    import App from './App.jsx';
//    to:
//    import App from './AppProbe.jsx';
// 2) Reload the app. If you see this content, BrowserRouter + providers are fine,
//    and the issue is likely inside App.jsx routes/lazy loading.
// 3) Revert the import after testing.

const AppProbe = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'var(--text)' }}>App Probe Online</h1>
      <p>This minimal component confirms the root is rendering correctly.</p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
        <Link to="/" className="btn btn-outline">Go to Onboarding</Link>
      </div>
    </div>
  );
};

export default AppProbe;
