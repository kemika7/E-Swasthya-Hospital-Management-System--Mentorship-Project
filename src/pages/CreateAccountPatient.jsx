import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiHome, FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import AuthLayout from '../components/AuthLayout';
import BrandingHeader from '../components/BrandingHeader';
import homepageIllustration from '../assets/images/homepage1.png';
import { sanitizeInput } from '../utils/sanitize';
import { useAuth } from '../context/AuthContext';
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

const CreateAccountPatient = () => {
  const { login } = useAuth();
  const maxDateRaw = new Date();
  maxDateRaw.setFullYear(maxDateRaw.getFullYear() - 18);
  const maxDob = maxDateRaw.toISOString().split('T')[0];
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    setError(''); // clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const passwordErrorMsg = getPasswordError(form.password);
    if (passwordErrorMsg) {
      setError(`Password Error: ${passwordErrorMsg} (Entered password: ${form.password.replace(/./g, '*')})`);
      return;
    }
    if (form.phone.length !== 10 || !/^\d+$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    
    if (form.dob) {
      const calculatedAge = Math.floor((new Date() - new Date(form.dob)) / 31557600000);
      if (calculatedAge < 18) {
        setError('You must be at least 18 years old to register.');
        return;
      }
    }
    
    if (form.password.toLowerCase() === form.email.toLowerCase() || form.password.toLowerCase() === form.name.toLowerCase()) {
      setError('Password cannot be the same as your email or name.');
      return;
    }

    try {
      const { apiFetch } = await import('../services/apiClient');
      
      // Exclude confirmPassword from the actual api payload
      const { confirmPassword, ...payload } = form;
      
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.requireOtp) {
        setRegisteredEmail(res.email);
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.message || 'Error occurred during registration.');
    }
  };

  const handleOtpSuccess = (data) => {
    setShowOtpModal(false);
    login(data); // Auto-login using the token provided upon OTP success
  };

  return (
    <AuthLayout leftHeader={<BrandingHeader />} illustrationSrc={homepageIllustration}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Creating New Account in as <span style={{ color: 'var(--primary)' }}>Patient</span>
        </h2>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

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
            <select
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="select"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--text)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>Select your city/location</option>
              {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Banepa', 'Dhulikhel', 'Pokhara', 'Biratnagar', 'Dharan', 'Itahari', 'Bharatpur', 'Hetauda', 'Janakpur', 'Butwal', 'Bhairahawa', 'Nepalgunj', 'Dhangadhi', 'Birtamod', 'Birgunj', 'Siddharthanagar', 'Tulsipur', 'Ghorahi', 'Birendranagar', 'Damak', 'Lahan', 'Rajbiraj', 'Bhimdutta', 'Triyuga', 'Mechinagar', 'Tikapur', 'Vyas', 'Lekhnath', 'Kamalamai', 'Godawari', 'Kirtipur', 'Madhyapur Thimi'].sort().map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
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
              max={maxDob}
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

        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
          Confirm Password
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
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              {showConfirmPassword ? (
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
      
      {showOtpModal && (
        <OtpVerificationModal 
          email={registeredEmail}
          type="registration"
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
        />
      )}
    </AuthLayout>
  );
};

export default CreateAccountPatient;
