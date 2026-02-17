import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
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
    otp: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  const handleRoleClick = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.role === 'patient') {
      const emailValid = /\S+@\S+\.\S+/.test(form.email);
      if (!form.username || !emailValid || !form.password) return;
      login({ name: form.username, email: form.email, role: 'patient' });
      return;
    }
    if (form.role === 'doctor') {
      if (!form.name || !form.email || !form.password) return;
      login({ name: form.name, email: form.email, role: 'doctor' });
      return;
    }
    if (form.role === 'admin') {
      if (!form.username || !form.password) return;
      login({ name: form.username, email: null, role: 'admin' });
      return;
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

      {isPatient ? (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
            Username
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

          <button
            type="button"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: 12,
              border: '1px solid rgba(15,23,42,0.15)',
              backgroundColor: 'var(--white)',
              color: 'var(--text)',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <FcGoogle size={20} />
            <span>Sign Up With Google</span>
          </button>
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
            Sign In
          </button>

          <button
            type="button"
            onClick={() => navigate('/register/doctor')}
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
            Register as a New Doctor
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
