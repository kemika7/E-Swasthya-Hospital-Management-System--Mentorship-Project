import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone, FiChevronRight } from 'react-icons/fi';
import { apiFetch } from '../../services/apiClient';

const SPEC_CONFIG = {
  Cardiology:       { icon: '❤️', color: '#ef4444', bg: '#fef2f2' },
  Neurology:        { icon: '🧠', color: '#8b5cf6', bg: '#f5f3ff' },
  Orthopedics:      { icon: '🦴', color: '#f59e0b', bg: '#fffbeb' },
  Pediatrics:       { icon: '👶', color: '#ec4899', bg: '#fdf2f8' },
  Dermatology:      { icon: '🧴', color: '#14b8a6', bg: '#f0fdfa' },
  Gynecology:       { icon: '🤰', color: '#e11d48', bg: '#fff1f2' },
  Ophthalmology:    { icon: '👁️', color: '#06b6d4', bg: '#ecfeff' },
  ENT:              { icon: '👂', color: '#6366f1', bg: '#eef2ff' },
  Gastroenterology: { icon: '🫁', color: '#22c55e', bg: '#f0fdf4' },
  Pulmonology:      { icon: '🌬️', color: '#3b82f6', bg: '#eff6ff' },
};

const DEFAULT_SPEC = { icon: '⚕️', color: '#64748b', bg: '#f8fafc' };

const HospitalSpecializationsPage = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSpec, setHoveredSpec] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospitals, specs] = await Promise.all([
          apiFetch('/doctors/hospitals'),
          apiFetch(`/doctors/hospitals/${hospitalId}/specializations`),
        ]);
        const found = hospitals.find(h => String(h.id) === String(hospitalId));
        setHospital(found || null);
        setSpecializations(specs);
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hospitalId]);

  if (loading) {
    return (
      <div className="layout-main" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e2e8f0',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="layout-main" style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Hospital Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        borderRadius: 20,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '30%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <button
          onClick={() => navigate('/patient/hospitals')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: 'none', backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: '0.8rem',
            backdropFilter: 'blur(10px)',
          }}
        >
          <FiArrowLeft size={18} color="#fff" />
        </button>

        {hospital && (
          <>
            <h1 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              {hospital.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <FiMapPin size={14} color="rgba(255,255,255,0.8)" />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>{hospital.location}</span>
            </div>
            {hospital.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <FiPhone size={13} color="rgba(255,255,255,0.7)" />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>{hospital.phone}</span>
              </div>
            )}
            {hospital.type && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 600,
                padding: '0.2rem 0.6rem', borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff', backdropFilter: 'blur(10px)',
              }}>
                {hospital.type}
              </span>
            )}
          </>
        )}
      </div>

      {/* Section Title */}
      <div style={{ marginBottom: '1rem', paddingLeft: '0.2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>
          Choose a Specialization
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {specializations.length} specializations available
        </p>
      </div>

      {/* Specialization Cards Grid */}
      {specializations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩺</p>
          <p>No specializations found for this hospital.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '0.8rem',
        }}>
          {specializations.map((spec, idx) => {
            const config = SPEC_CONFIG[spec] || DEFAULT_SPEC;
            const isHovered = hoveredSpec === spec;

            return (
              <div
                key={spec}
                onClick={() => navigate(`/patient/hospital/${hospitalId}/doctors?spec=${encodeURIComponent(spec)}`)}
                onMouseEnter={() => setHoveredSpec(spec)}
                onMouseLeave={() => setHoveredSpec(null)}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 16,
                  padding: '1.2rem',
                  cursor: 'pointer',
                  boxShadow: isHovered
                    ? `0 8px 25px ${config.color}20`
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  border: `1px solid ${isHovered ? config.color + '30' : '#f1f5f9'}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: config.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', flexShrink: 0,
                  transition: 'transform 0.3s',
                  transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                }}>
                  {config.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '0.95rem', fontWeight: 600,
                    color: 'var(--text)', marginBottom: '0.15rem',
                  }}>
                    {spec}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                    View doctors
                  </p>
                </div>

                <FiChevronRight
                  size={18}
                  color={isHovered ? config.color : '#cbd5e1'}
                  style={{
                    transition: 'all 0.3s',
                    transform: isHovered ? 'translateX(3px)' : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* View All Doctors Button */}
      <div style={{ marginTop: '1.5rem' }}>
        <button
          onClick={() => navigate(`/patient/hospital/${hospitalId}/doctors`)}
          style={{
            width: '100%', padding: '0.9rem',
            borderRadius: 14,
            border: '2px solid var(--primary)',
            backgroundColor: 'transparent',
            color: 'var(--primary)',
            fontSize: '0.9rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.target.style.backgroundColor = 'var(--primary)'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--primary)'; }}
        >
          View All Doctors →
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HospitalSpecializationsPage;
