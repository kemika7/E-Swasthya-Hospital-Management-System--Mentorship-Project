import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiUser } from 'react-icons/fi';
import { useAppointment } from '../../context/AppointmentContext';

const Appointments = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointment();

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
          My Appointments
        </div>

        <div style={{ width: 40 }} />
      </div>

      {/* APPOINTMENTS LIST */}
      <section>
        {appointments && appointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map((appointment, idx) => (
              <div
                key={`${appointment.bookedAt}-${idx}`}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 16,
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderLeft: '5px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                      {appointment.doctorName}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500 }}>
                      {appointment.specialty}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {appointment.status}
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '0.25rem 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    <FiCalendar color="var(--primary)" />
                    <span>{appointment.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    <FiClock color="var(--primary)" />
                    <span>{appointment.time}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <FiMapPin color="var(--primary)" />
                  <span>{appointment.location || 'Kathmandu, Nepal'}</span>
                </div>

                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                     style={{
                       padding: '0.5rem 1rem',
                       borderRadius: 8,
                       border: '1px solid #e2e8f0',
                       backgroundColor: 'transparent',
                       color: '#64748b',
                       fontSize: '0.8rem',
                       cursor: 'pointer',
                     }}
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <FiCalendar size={32} color="#cbd5e1" />
            </div>
            <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Upcoming Appointments</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: 250, margin: '0 auto' }}>
              You haven't booked any appointments yet. Find a doctor to get started.
            </p>
            <button
              onClick={() => navigate('/patient/doctors')}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: 12,
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'var(--text)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Find Doctors
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Appointments;
