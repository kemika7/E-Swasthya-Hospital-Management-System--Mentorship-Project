import React, { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import BrandingHeader from '../components/BrandingHeader';
import loginIllustration from '../assets/images/login.png';
import { sanitizeInput } from '../utils/sanitize';

const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

const getPasswordError = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain a number.';
  if (!/(?=.*[\W_])/.test(password)) return 'Password must contain a special character (e.g., !@#$%).';
  return null;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { apiFetch } = await import('../services/apiClient');
      const res = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: sanitizeInput(email) }),
      });
      // Backend returns technical success regardless for generic security
      setSuccessMsg(res.message || 'If your email exists, a reset link has been sent.');
    } catch (err) {
      // Still show generic message or specific error if backend allows
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout leftHeader={<BrandingHeader />} illustrationSrc={loginIllustration}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem' }}>
          Forgot Password?
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(15,23,42,0.6)', margin: 0 }}>
          Enter your email address and we'll send you a secure link to reset your password.
        </p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      {successMsg && (
        <div style={{ padding: '0.75rem', borderRadius: 12, backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleRequestToken} style={{ display: 'grid', gap: '1.25rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Email Address
            <div style={{
              marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--white)', borderRadius: 12,
              boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.12)',
              padding: '0.75rem 1rem',
            }}>
              <FiMail size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '0.95rem', color: 'var(--text)', backgroundColor: 'transparent',
                }}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none',
              backgroundColor: 'var(--primary)', color: 'var(--white)',
              fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease', marginTop: '0.5rem',
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => navigate('/login')}
        style={{
          width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none',
          backgroundColor: successMsg ? 'var(--primary)' : 'transparent', 
          color: successMsg ? 'white' : 'var(--primary)',
          fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Back to Login
      </button>
    </AuthLayout>
  );
};

export default ForgotPassword;
