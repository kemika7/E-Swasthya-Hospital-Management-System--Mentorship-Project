import React, { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import BrandingHeader from '../components/BrandingHeader';
import loginIllustration from '../assets/images/login.png';
import { sanitizeInput } from '../utils/sanitize';

const getPasswordError = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain a number.';
  if (!/(?=.*[\W_])/.test(password)) return 'Password must contain a special character.';
  return null;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (!t) {
      setError('Invalid or missing reset token.');
    } else {
      setToken(t);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!token) {
      setError('Token is missing. Please request a new reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordErrorMsg = getPasswordError(newPassword);
    if (passwordErrorMsg) {
      setError(`Password Error: ${passwordErrorMsg}`);
      return;
    }

    setLoading(true);
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: sanitizeInput(newPassword) }),
      });
      
      setSuccessMsg('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout leftHeader={<BrandingHeader />} illustrationSrc={loginIllustration}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem' }}>
          Reset Password
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(15,23,42,0.6)', margin: 0 }}>
          Enter your new password below to secure your account.
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

      {token && !successMsg && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            New Password
            <div style={{
              marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--white)', borderRadius: 12,
              boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.12)',
              padding: '0.75rem 1rem',
            }}>
              <FiLock size={18} style={{ opacity: 0.5 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                required
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '0.95rem', color: 'var(--text)', backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <FiEyeOff size={18} style={{ opacity: 0.5 }} /> : <FiEye size={18} style={{ opacity: 0.5 }} />}
              </button>
            </div>
          </label>

          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Confirm New Password
            <div style={{
              marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--white)', borderRadius: 12,
              boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.12)',
              padding: '0.75rem 1rem',
            }}>
              <FiLock size={18} style={{ opacity: 0.5 }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                required
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '0.95rem', color: 'var(--text)', backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                {showConfirmPassword ? <FiEyeOff size={18} style={{ opacity: 0.5 }} /> : <FiEye size={18} style={{ opacity: 0.5 }} />}
              </button>
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {(!token || successMsg) && (
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none',
            backgroundColor: 'transparent', color: 'var(--primary)',
            fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
