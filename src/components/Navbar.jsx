import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import logo from '../assets/images/logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout, isAuthenticated } = useAuth();
  const { selectedHospital, clearHospital } = useHospital();

  const isAuthPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '0 1.5rem',
        background: 'var(--white)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Welcome back, <span style={{ color: 'var(--text)', fontWeight: 600 }}>{userProfile?.name}</span></span>
        {selectedHospital && (
          <>
            <span style={{ color: 'rgba(15,23,42,0.2)' }}>|</span>
            <button 
              onClick={() => { clearHospital(); navigate('/patient/select-hospital'); }}
              style={{ 
                fontSize: '0.85rem', 
                color: 'var(--primary)', 
                fontWeight: 500,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(82,178,191,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              title="Click to Change Hospital"
            >
              🏥 {selectedHospital.name}
            </button>
          </>
        )}
      </div>

      {!isAuthPage && isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {userProfile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiUser size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                  {userProfile.name}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    textTransform: 'capitalize',
                  }}
                >
                  {userProfile.role}
                </span>
              </div>
            </div>
          )}

          <div
            style={{
              height: 24,
              width: 1,
              backgroundColor: 'rgba(15, 23, 42, 0.08)',
            }}
          />

          <button
            onClick={logout}
            className="btn btn-outline"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.05)',
              color: '#ef4444',
            }}
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
