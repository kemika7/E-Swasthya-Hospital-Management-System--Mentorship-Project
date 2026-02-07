import React, { useEffect, useState } from 'react';
import homepageImage from '../assets/images/homepage1.png';

const AuthLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        width: '100%',
        backgroundColor: 'var(--background)',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      <div
        style={{
          flex: isMobile ? '0 0 auto' : 1,
          backgroundColor: 'var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--white)',
            }}
          >
            E-SWASTHYA
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 0',
          }}
        >
          <img
            src={homepageImage}
            alt="Healthcare illustration"
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
