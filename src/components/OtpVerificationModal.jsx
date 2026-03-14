import React, { useState } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';

const OtpVerificationModal = ({ email, onClose, onSuccess, type = 'registration' }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { apiFetch } = await import('../services/apiClient');
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp, type }),
      });
      
      onSuccess(data); // Returns user and token on success
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const { apiFetch } = await import('../services/apiClient');
      await apiFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, type }),
      });
      setSuccessMsg('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 20,
        padding: '2rem',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'slideUp 0.3s ease'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem', right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text)',
            opacity: 0.6,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
        >
          <FiX size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: 60, height: 60, 
            borderRadius: '50%', 
            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#4CAF50'
          }}>
            <FiCheckCircle size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem' }}>
            Verify Your Email
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(15,23,42,0.6)', margin: 0 }}>
            We've sent a 6-digit verification code to
            <strong style={{ color: 'var(--text)', display: 'block', marginTop: '0.25rem' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: 8, 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            fontSize: '0.85rem', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {successMsg && (
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: 8, 
            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
            color: '#4CAF50', 
            fontSize: '0.85rem', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{
              padding: '1rem',
              borderRadius: 12,
              border: '2px solid rgba(15,23,42,0.1)',
              fontSize: '1.25rem',
              textAlign: 'center',
              letterSpacing: '0.5rem',
              fontWeight: 600,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(15,23,42,0.1)'}
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              padding: '0.9rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'var(--white)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
              opacity: (loading || otp.length !== 6) ? 0.7 : 1,
              transition: 'all 0.2s ease',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(15,23,42,0.6)' }}>
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={handleResend}
            disabled={resending}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: 600, 
              cursor: resending ? 'not-allowed' : 'pointer',
              padding: 0
            }}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OtpVerificationModal;
