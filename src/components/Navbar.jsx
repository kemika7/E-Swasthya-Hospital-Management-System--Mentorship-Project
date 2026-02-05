import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiHeart, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { userProfile, logout, isAuthenticated } = useAuth();

  const isAuthPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <header
      style={{
        padding: '0.75rem 1.25rem',
        background: 'var(--white)',
        boxShadow: 'var(--shadow-soft)',
        borderRadius: '0 0 16px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <Link
        to="/"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '999px',
            background: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <FiHeart size={18} />
        </span>
        <span>CareBridge Hospital</span>
      </Link>

      {!isAuthPage && isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {userProfile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.9rem',
              }}
            >
              <FiUser size={16} />
              <span>{userProfile.name}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary)',
                  background: 'rgba(82,178,191,0.08)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: 999,
                  textTransform: 'capitalize',
                }}
              >
                {userProfile.role}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="btn btn-outline"
            style={{ paddingInline: '0.9rem' }}
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

