import React from 'react';

const AuthLayout = ({ children, leftHeader, illustrationSrc }) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 767 : false;

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
        flex: 1,
          backgroundColor: 'var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {leftHeader || (
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--white)',
              }}
            >
              E-SWASTHYA
            </span>
          )}
        </div>
        {!isMobile && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 0',
            }}
          >
            {illustrationSrc && (
              <img
                src={illustrationSrc}
                alt="Healthcare illustration"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            )}
          </div>
        )}
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
