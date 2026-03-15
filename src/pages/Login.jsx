import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiActivity } from 'react-icons/fi';

const HOSPITALS = [
  { id: 1, name: 'City Hospital' },
  { id: 2, name: 'Green Valley Hospital' },
  { id: 3, name: 'Sunrise Medical Center' },
  { id: 4, name: 'Lakeside Clinic' },
  { id: 5, name: 'Royal Care Hospital' },
];
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import BrandingHeader from '../components/BrandingHeader';
import loginIllustration from '../assets/images/login.png';
import homepageIllustration from '../assets/images/homepage1.png';
import { sanitizeInput } from '../utils/sanitize';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    username: '',
    hospitalId: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    setError('');
  };

  const handleRoleClick = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate hospital for doctor login
    if (form.role === 'doctor' && !form.hospitalId) {
      setError('Please select a hospital to continue.');
      return;
    }

    const loginEmail = form.role === 'patient' || form.role === 'doctor' ? form.email : form.username;

    try {
      const { apiFetch } = await import('../services/apiClient');
      const selectedHospital = HOSPITALS.find(h => h.id === Number(form.hospitalId));
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail,
          password: form.password,
          role: form.role,
          ...(form.role === 'doctor' && {
            hospitalId: form.hospitalId,
            hospitalName: selectedHospital?.name,
          }),
        }),
      });
      login(data);
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { apiFetch } = await import('../services/apiClient');
      const data = await apiFetch('/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });
      login(data);
    } catch (err) {
      console.error('Google Login Error:', err);
      alert(err.message || 'Google Login Failed');
    }
  };

  const isPatient = form.role === 'patient';
  const leftHeader = <BrandingHeader />;

  return (
    <AuthLayout leftHeader={leftHeader} illustrationSrc={isPatient ? homepageIllustration : loginIllustration}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span>Log in as</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {['patient', 'doctor', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleClick(role)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 9999,
                  border: 'none',
                  backgroundColor: form.role === role ? 'var(--primary)' : 'transparent',
                  color: form.role === role ? 'var(--white)' : 'var(--text)',
                  fontSize: '1rem',
                  fontWeight: form.role === role ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isPatient ? (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Email Address
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-soft)',
                border: '1px solid rgba(15,23,42,0.12)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiMail size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </label>

          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Password
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-soft)',
                border: '1px solid rgba(15,23,42,0.12)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiLock size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? (
                  <FiEyeOff size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
                ) : (
                  <FiEye size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
                )}
              </button>
            </div>
          </label>

          <div style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'none' }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'var(--white)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(82, 178, 191, 0.35)',
              marginTop: '0.25rem',
            }}
          >
            LOGIN
          </button>

          <button
            type="button"
            onClick={() => navigate('/create-account/patient')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Create a New Account
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '0.5rem 0 1rem',
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(15,23,42,0.1)' }} />
            <span style={{ fontSize: '0.9rem', color: 'rgba(15,23,42,0.6)' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(15,23,42,0.1)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
              theme="outline"
              size="large"
              width="300"
            />
          </div>
        </form>
      ) : form.role === 'doctor' ? (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Doctor Full Name
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 8,
                border: '1px solid rgba(15,23,42,0.15)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiUser size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </label>

          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Email Address OR Doctor ID
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 8,
                border: '1px solid rgba(15,23,42,0.15)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiMail size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type="text"
                name="email"
                placeholder="you@example.com or DOC-1234"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </label>

          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Password
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 8,
                border: '1px solid rgba(15,23,42,0.15)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiLock size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? (
                  <FiEyeOff size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
                ) : (
                  <FiEye size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
                )}
              </button>
            </div>
          </label>

          <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'none' }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Hospital Dropdown */}
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Select Hospital
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 8,
                border: form.hospitalId === '' && error.includes('hospital')
                  ? '1px solid #ef4444'
                  : '1px solid rgba(15,23,42,0.15)',
                padding: '0.75rem 1rem',
                transition: 'border-color 0.2s',
              }}
            >
              <FiActivity size={18} style={{ opacity: 0.5, color: 'var(--text)', flexShrink: 0 }} />
              <select
                name="hospitalId"
                value={form.hospitalId}
                onChange={handleChange}
                aria-label="Select Hospital"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: form.hospitalId ? 'var(--text)' : '#94a3b8',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  appearance: 'auto',
                }}
              >
                <option value="" disabled>Choose your hospital</option>
                {HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </label>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'var(--white)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              marginTop: '0.5rem',
            }}
          >
            Sign In
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Username
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 8,
                border: '1px solid rgba(15,23,42,0.15)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiUser size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </label>

          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Password
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 8,
                border: '1px solid rgba(15,23,42,0.15)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiLock size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? (
                  <FiEyeOff size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
                ) : (
                  <FiEye size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
                )}
              </button>
            </div>
          </label>

          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            OTP (optional)
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                borderRadius: 8,
                border: '1px solid rgba(15,23,42,0.15)',
                padding: '0.75rem 1rem',
              }}
            >
              <FiLock size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP if required"
                value={form.otp}
                onChange={handleChange}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--text)',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </label>

          <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'var(--white)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              marginTop: '0.5rem',
            }}
          >
            Secure Login
          </button>
        </form>
      )}

    </AuthLayout>
  );
};

export default Login;
