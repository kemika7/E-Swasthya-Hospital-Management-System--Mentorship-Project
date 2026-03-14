import React, { useMemo, useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiHome, FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import BrandingHeader from '../components/BrandingHeader';
import homepageIllustration from '../assets/images/homepage1.png';
import { medicalCategories } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
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

const DoctorRegister = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    regNumber: '',
    specialization: '',
    hospital: '',
    password: '',
    confirmPassword: '',
    confirmAccurate: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const specializations = useMemo(() => {
    return medicalCategories.flatMap((c) => c.specialties?.map((s) => s.name) || []);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : sanitizeInput(value) }));
    if (type !== 'checkbox') setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailValid = /\S+@\S+\.\S+/.test(form.email);
    const required =
      form.name &&
      emailValid &&
      form.phone &&
      form.address &&
      form.regNumber &&
      form.specialization &&
      form.hospital &&
      form.password &&
      form.confirmAccurate;
    
    if (!required) {
        setError('Please fill in all required fields accurately.');
        return;
    }

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
    if (form.password.toLowerCase() === form.email.toLowerCase() || form.password.toLowerCase() === form.name.toLowerCase()) {
      setError('Password cannot be the same as your email or name.');
      return;
    }
    
    try {
      const { apiFetch } = await import('../services/apiClient');
      
      const { confirmPassword, confirmAccurate, ...payload } = form;

      const res = await apiFetch('/auth/register-doctor', {
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
    login({ token: data.token, user: data.user });
  };

  return (
    <AuthLayout leftHeader={<BrandingHeader />} illustrationSrc={homepageIllustration}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Creating New Account in as <span style={{ color: 'var(--primary)' }}>Doctor</span>
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
          Medical Registration Number
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
              name="regNumber"
              placeholder="e.g., NMC-XXXXXX"
              value={form.regNumber}
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
          Specialization
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
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              className="select"
              style={{ flex: 1, backgroundColor: 'transparent' }}
            >
              <option value="" disabled>
                Select specialization
              </option>
              {specializations.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
          Hospital / Clinic Name
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
              name="hospital"
              placeholder="Enter hospital or clinic name"
              value={form.hospital}
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
          <input type="checkbox" name="confirmAccurate" checked={form.confirmAccurate} onChange={handleChange} />
          <span>I confirm that the above information is accurate</span>
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

export default DoctorRegister;
