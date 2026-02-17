import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiHome, FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import AuthLayout from '../components/AuthLayout';
import BrandingHeader from '../components/BrandingHeader';
import homepageIllustration from '../assets/images/homepage1.png';
import { sanitizeInput } from '../utils/sanitize';
import { useAuth } from '../context/AuthContext';

const CreateAccountPatient = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailValid = /\S+@\S+\.\S+/.test(form.email);
    if (!form.name || !emailValid || !form.phone || !form.address || !form.dob || !form.password) return;
    login({ name: form.name, email: form.email, role: 'patient' });
  };

  return (
    <AuthLayout leftHeader={<BrandingHeader />} illustrationSrc={homepageIllustration}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Creating New Account in as <span style={{ color: 'var(--primary)' }}>Patient</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
          Full Name
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
          Phone Number
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
            <FiPhone size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
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
          Address
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
            <FiHome size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
            <input
              type="text"
              name="address"
              placeholder="Enter your address"
              value={form.address}
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
          Date of Birth
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
            <FiCalendar size={18} style={{ opacity: 0.5, color: 'var(--text)' }} />
            <input
              type="date"
              name="dob"
              value={form.dob}
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
              placeholder="Create a password"
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
          Sign IN
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
    </AuthLayout>
  );
};

export default CreateAccountPatient;
