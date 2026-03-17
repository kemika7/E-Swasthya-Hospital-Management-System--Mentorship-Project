import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiPhone, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import { apiFetch } from '../../services/apiClient';
import { useHospital } from '../../context/HospitalContext';

const HOSPITAL_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ef4444', '#22c55e', '#3b82f6', '#e11d48',
  '#0ea5e9', '#d946ef', '#84cc16', '#f97316', '#64748b',
];

const HOSPITAL_ICONS = [
  '🏥', '🏨', '🩺', '💊', '🧬',
  '🫀', '🧠', '🦴', '👶', '🔬',
  '🏗️', '🌿', '📚', '⚕️', '🔭',
];

const TYPE_STYLES = {
  Government: { bg: '#dbeafe', color: '#1e40af', label: 'Government' },
  Private: { bg: '#fce7f3', color: '#9d174d', label: 'Private' },
  Teaching: { bg: '#d1fae5', color: '#065f46', label: 'Teaching' },
};

const HospitalsPage = () => {
  const navigate = useNavigate();
  const { selectedHospital, setSelectedHospital } = useHospital();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await apiFetch('/doctors/hospitals');
        setHospitals(data);
      } catch (err) {
        console.error('Failed to fetch hospitals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout-main" style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
        borderRadius: 20,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: '40%',
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          🏥 Choose a Hospital
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Select from {hospitals.length} leading hospitals in Nepal
        </p>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          borderRadius: 12, padding: '0.6rem 1rem',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <FiSearch size={18} color="rgba(255,255,255,0.7)" />
          <input
            type="text"
            placeholder="Search hospitals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', color: '#fff',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e2e8f0',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }} />
          Loading hospitals...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
          <p>No hospitals found matching "{search}"</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {filtered.map((hospital, idx) => {
            const color = HOSPITAL_COLORS[idx % HOSPITAL_COLORS.length];
            const icon = HOSPITAL_ICONS[idx % HOSPITAL_ICONS.length];
            const isHovered = hoveredId === hospital.id;

            return (
              <div
                key={hospital.id}
                onMouseEnter={() => setHoveredId(hospital.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 24,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: isHovered
                    ? '0 12px 24px rgba(0,0,0,0.06)'
                    : '0 4px 12px rgba(0,0,0,0.03)',
                  border: '1px solid',
                  borderColor: selectedHospital?.id === hospital.id ? 'var(--primary)' : '#f1f5f9',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-6px)' : 'none',
                  cursor: 'default'
                }}
              >
                {/* Visual Header / Icon area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: `${color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', flexShrink: 0
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '0.2rem',
                      lineHeight: 1.3
                    }}>
                      {hospital.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                      }}>
                        {hospital.type || 'Private'}
                      </span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <FiMapPin size={12} />
                        <span>{hospital.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: '#f1f5f9' }} />

                {/* Body Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {hospital.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                      <FiPhone size={14} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                      <span>{hospital.phone}</span>
                    </div>
                  )}
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    lineHeight: 1.5,
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {hospital.description || 'Dedicated to providing high-quality healthcare services with modern facilities and experienced medical professionals.'}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setSelectedHospital({ id: hospital.id, name: hospital.name });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: 14,
                      backgroundColor: selectedHospital?.id === hospital.id ? 'var(--primary)' : 'rgba(82, 178, 191, 0.08)',
                      color: selectedHospital?.id === hospital.id ? 'var(--white)' : 'var(--primary)',
                      border: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {selectedHospital?.id === hospital.id ? (
                      <><FiCheckCircle size={18} /> Selected as My Hospital</>
                    ) : (
                      'Select as My Hospital'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedHospital({ id: hospital.id, name: hospital.name });
                      navigate(`/patient/hospital/${hospital.id}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: 14,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    View Details <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
};

export default HospitalsPage;
