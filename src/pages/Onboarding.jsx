import React from 'react';
import { useNavigate } from 'react-router-dom';
import homepage1 from '../assets/images/homepage1.png';

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <main className="onboarding-shell">
      <div className="onboarding-hero">
        <div className="onboarding-hero-inner">
          <img
            src={homepage1}
            alt="Healthcare illustration"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-content-inner" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '2rem',
              lineHeight: 1.15,
              fontWeight: 800,
              color: '#171710',
            }}
          >
            Your Health, Our Priority!
          </h1>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              backgroundColor: '#52B2BF',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;
