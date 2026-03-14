import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import BrandingHeader from '../components/BrandingHeader';
import loginIllustration from '../assets/images/login.png';
import { sanitizeInput } from '../utils/sanitize';
import OtpVerificationModal from '../components/OtpVerificationModal';

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
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: sanitizeInput(email) }),
      });
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    setStep(2); // Move to set new password
    setSuccessMsg('Email verified. Please enter your new password.');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const passwordErrorMsg = getPasswordError(newPassword);
    if (passwordErrorMsg) {
      setError(`Password Error: ${passwordErrorMsg} (Entered password: ${newPassword.replace(/./g, '*')})`);
      return;
    }

    setLoading(true);
    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      
      setSuccessMsg('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout leftHeader={<BrandingHeader />} illustrationSrc={loginIllustration}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem' }}>
          {step === 1 ? 'Forgot Password?' : 'Reset Password'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(15,23,42,0.6)', margin: 0 }}>
          {step === 1 
            ? "Enter your email address and we'll send you a code to reset your password." 
            : "Enter your new password below."}
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

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} style={{ display: 'grid', gap: '1.25rem' }}>
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
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none',
              backgroundColor: 'transparent', color: 'var(--primary)',
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Back to Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: '1.1rem' }}>
          {/* We secretly store OTP from modal or ask for it here if modal was closed but state kept. 
              Since handleOtpSuccess hides modal, we should show input for OTP here just in case they closed modal manually. */}
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Reset Code (OTP)
            <div style={{
              marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--white)', borderRadius: 12,
              boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.12)',
              padding: '0.75rem 1rem',
            }}>
              <FiLock size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '0.95rem', color: 'var(--text)', backgroundColor: 'transparent',
                }}
              />
            </div>
          </label>

          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            New Password
            <div style={{
              marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--white)', borderRadius: 12,
              boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.12)',
              padding: '0.75rem 1rem',
            }}>
              <FiLock size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
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
              <FiLock size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
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
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none',
              backgroundColor: 'var(--primary)', color: 'var(--white)',
              fontSize: '1rem', fontWeight: 600, cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
              opacity: (loading || otp.length !== 6) ? 0.7 : 1, transition: 'all 0.2s ease', marginTop: '0.5rem',
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {showOtpModal && (
        <OtpVerificationModal 
          email={email}
          type="reset"
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
        />
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
