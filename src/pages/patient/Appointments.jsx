import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import { useAppointment } from '../../context/AppointmentContext';

const REASON_OPTIONS = ['Follow Up', 'Routine Check-up', 'Prescription Renewal', 'Lab Report Discussion', 'Other'];

const Appointments = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { appointmentDetails, updateAppointmentDetails, bookAppointment } = useAppointment();
  const [showSuccess, setShowSuccess] = useState(false);
  const [reasonDropdownOpen, setReasonDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setReasonDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookNow = () => {
    bookAppointment();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/patient/dashboard');
    }, 1500);
  };

  const handlePaymentSelect = (method) => {
    updateAppointmentDetails({ paymentMethod: method });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        padding: '1rem',
        paddingBottom: '2rem',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      {/* TOP HEADER BAR */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: 16,
          padding: '0.9rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/patient/dashboard')}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft size={20} style={{ color: 'var(--white)' }} />
        </button>

        <div
          style={{
            flex: 1,
            textAlign: 'center',
            color: 'var(--white)',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          Appointment
        </div>

        <div style={{ width: 40 }} />
      </div>

      {/* SELECTED DATE & TIME SECTION */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.75rem',
          }}
        >
          Selected Date & Time
        </h2>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
          }}
        >
          {/* Day Card */}
          <div
            style={{
              flex: 1,
              minWidth: 90,
              backgroundColor: 'var(--white)',
              borderRadius: 12,
              padding: '0.9rem',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.8, marginBottom: '0.35rem' }}>
              Day
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
              {appointmentDetails.day}
            </div>
          </div>

          {/* Month Card */}
          <div
            style={{
              flex: 1,
              minWidth: 90,
              backgroundColor: 'var(--white)',
              borderRadius: 12,
              padding: '0.9rem',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.8, marginBottom: '0.35rem' }}>
              Month
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
              {appointmentDetails.month}
            </div>
          </div>

          {/* Time Card */}
          <div
            style={{
              flex: 1,
              minWidth: 90,
              backgroundColor: 'var(--white)',
              borderRadius: 12,
              padding: '0.9rem',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.8, marginBottom: '0.35rem' }}>
              Time
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
              {appointmentDetails.time}
            </div>
          </div>
        </div>
      </section>

      {/* REASON TO VISIT SECTION */}
      <section style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.5rem',
          }}
        >
          Reason To Visit
        </label>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setReasonDropdownOpen(!reasonDropdownOpen)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(148,163,184,0.2)',
              borderRadius: 12,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '0.95rem',
              color: 'var(--text)',
              textAlign: 'left',
            }}
          >
            <span>{appointmentDetails.reasonToVisit}</span>
            <FiChevronDown size={20} style={{ color: 'var(--text)' }} />
          </button>

          {reasonDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.25rem',
                backgroundColor: 'var(--white)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-soft)',
                zIndex: 10,
                overflow: 'hidden',
              }}
            >
              {REASON_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    updateAppointmentDetails({ reasonToVisit: opt });
                    setReasonDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    color: 'var(--text)',
                    textAlign: 'left',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TOTAL CHARGES SECTION */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.75rem',
          }}
        >
          Total Charges
        </h2>
        <div
          style={{
            backgroundColor: 'var(--white)',
            borderRadius: 12,
            padding: '1rem',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.95rem',
              color: 'var(--text)',
            }}
          >
            <span>Doctor Appointment Fee</span>
            <span>Rs. {appointmentDetails.doctorFee}</span>
          </div>
          <div
            style={{
              height: 1,
              backgroundColor: 'rgba(23,23,16,0.1)',
              margin: '0.75rem 0',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            <span>Total</span>
            <span>Rs. {appointmentDetails.total}</span>
          </div>
        </div>
      </section>

      {/* PAYMENT METHOD SECTION */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.75rem',
          }}
        >
          Payment Method
        </h2>
        <div
          style={{
            backgroundColor: 'rgba(148,163,184,0.15)',
            borderRadius: 12,
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => handlePaymentSelect('esewa')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: appointmentDetails.paymentMethod === 'esewa' ? '2px solid var(--primary)' : '2px solid transparent',
                backgroundColor: 'var(--white)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              eSewa
            </button>
            <button
              type="button"
              onClick={() => handlePaymentSelect('fonepay')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: appointmentDetails.paymentMethod === 'fonepay' ? '2px solid var(--primary)' : '2px solid transparent',
                backgroundColor: 'var(--white)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              FonePay
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="tel"
              placeholder="Phone Number"
              value={appointmentDetails.phoneNumber}
              onChange={(e) => updateAppointmentDetails({ phoneNumber: e.target.value })}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 10,
                border: '1px solid rgba(23,23,16,0.12)',
                fontSize: '0.9rem',
                backgroundColor: 'var(--white)',
                outline: 'none',
              }}
            />
            <input
              type="password"
              placeholder="MPIN"
              value={appointmentDetails.mpin}
              onChange={(e) => updateAppointmentDetails({ mpin: e.target.value })}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 10,
                border: '1px solid rgba(23,23,16,0.12)',
                fontSize: '0.9rem',
                backgroundColor: 'var(--white)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'var(--white)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </section>

      {/* BOOK NOW BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          onClick={handleBookNow}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: 12,
            border: 'none',
            backgroundColor: 'var(--primary)',
            color: 'var(--text)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          Book Now
        </button>
      </div>

      {/* Mock Success Overlay */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--white)',
              borderRadius: 16,
              padding: '1.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)' }}>
              Appointment Booked Successfully!
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Appointments;
