import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="layout-main" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          backgroundColor: 'var(--white)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-soft)',
          padding: '2rem',
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text)' }}>404 - Not Found</h1>
        <p style={{ opacity: 0.8 }}>
          The page you’re looking for doesn’t exist. You can return to the home page.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
