import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.png';
import loginImage from '../assets/images/login.png';

const Login = () => {
  const { login } = useAuth();

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleClick = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.role === 'patient') {
      const emailValid = /\S+@\S+\.\S+/.test(form.email);
      if (!form.name || !emailValid || !form.password) return;
      login({ name: form.name, email: form.email, role: form.role });
      return;
    }
    if (form.role === 'doctor') {
      if (!form.name || !form.email || !form.password) return;
      login({ name: form.name, email: form.email, role: form.role });
      return;
    }
    if (form.role === 'admin') {
      if (!form.username || !form.password) return;
      login({ name: form.username, email: null, role: form.role });
      return;
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        width: '100%',
      }}
    >
      {/* LEFT SECTION - Branding & Illustration */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--primary)', // #52B2BF
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={logo}
            alt="E-SWASTHYA Logo"
            style={{
              height: 40,
              width: 'auto',
            }}
          />
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--white)',
            }}
          >
            E-SWASTHYA
          </span>
        </div>

        {/* Illustration - Centered vertically */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 0',
          }}
        >
          <img
            src={loginImage}
            alt="Login illustration"
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      {/* RIGHT SECTION - Login Form */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--white)', // #FFFFFF
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
          }}
        >
          {/* Login Header with Role Selection */}
          <div style={{ marginBottom: '2rem' }}>
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
                      backgroundColor:
                        form.role === role ? 'var(--primary)' : 'transparent',
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            {form.role !== 'admin' && (
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
                {form.role === 'doctor' ? 'Doctor Full Name' : 'Full Name'}
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
                    placeholder={form.role === 'doctor' ? 'Enter your full name' : 'Enter your full name'}
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
            )}

            {form.role === 'admin' && (
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
            )}

            {form.role !== 'admin' && (
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
                {form.role === 'doctor' ? 'Email Address OR Doctor ID' : 'Email Address'}
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
                    type={form.role === 'doctor' ? 'text' : 'email'}
                    name="email"
                    placeholder={form.role === 'doctor' ? 'you@example.com or DOC-1234' : 'you@example.com'}
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
            )}

            {/* Password */}
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

            {form.role === 'admin' && (
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
            )}

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // UI only
                }}
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign IN Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: 8,
                border: 'none',
                backgroundColor: 'var(--primary)', // #52B2BF
                color: 'var(--white)', // #FFFFFF
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                marginTop: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a9ba8';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary)';
              }}
            >
              {form.role === 'admin' ? 'Secure Login' : 'Sign In'}
            </button>

            {form.role === 'patient' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  margin: '1.5rem 0',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: 'rgba(15,23,42,0.1)',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(15,23,42,0.6)',
                  }}
                >
                  or
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: 'rgba(15,23,42,0.1)',
                  }}
                />
              </div>
            )}

            {form.role === 'patient' && (
              <button
                type="button"
                onClick={() => {}}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: 8,
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
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(15,23,42,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--white)';
                }}
              >
                <FcGoogle size={20} />
                <span>Sign in with Google</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
