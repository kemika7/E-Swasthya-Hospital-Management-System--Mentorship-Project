import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import homepage1 from '../assets/images/homepage1.png';

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F5F7',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 7,
          backgroundColor: '#52B2BF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem 1.25rem 1rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 360,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={homepage1}
              alt="Healthcare illustration"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 3,
          backgroundColor: '#F4F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 1.25rem 1.75rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 320,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
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
          <Button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              backgroundColor: '#52B2BF',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Get Started
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;

