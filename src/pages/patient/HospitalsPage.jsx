import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiPhone, FiChevronRight } from 'react-icons/fi';
import { apiFetch } from '../../services/apiClient';

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
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((hospital, idx) => {
            const color = HOSPITAL_COLORS[idx % HOSPITAL_COLORS.length];
            const icon = HOSPITAL_ICONS[idx % HOSPITAL_ICONS.length];
            const typeStyle = TYPE_STYLES[hospital.type] || TYPE_STYLES.Private;
            const isHovered = hoveredId === hospital.id;

            return (
              <div
                key={hospital.id}
                onClick={() => navigate(`/patient/hospital/${hospital.id}`)}
                onMouseEnter={() => setHoveredId(hospital.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 16,
                  padding: '1.2rem',
                  cursor: 'pointer',
                  boxShadow: isHovered
                    ? `0 8px 30px ${color}25`
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  border: `1px solid ${isHovered ? color + '40' : '#f1f5f9'}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s',
                }} />

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Icon */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', flexShrink: 0,
                    transition: 'transform 0.3s',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    {icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{
                        fontSize: '0.95rem', fontWeight: 600,
                        color: 'var(--text)', marginBottom: '0.3rem',
                        lineHeight: 1.3,
                      }}>
                        {hospital.name}
                      </h3>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        padding: '0.15rem 0.5rem', borderRadius: 6,
                        backgroundColor: typeStyle.bg, color: typeStyle.color,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {typeStyle.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                      <FiMapPin size={13} color="#94a3b8" />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{hospital.location}</span>
                    </div>

                    {hospital.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                        <FiPhone size={12} color="#94a3b8" />
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{hospital.phone}</span>
                      </div>
                    )}

                    <p style={{
                      fontSize: '0.78rem', color: '#94a3b8',
                      lineHeight: 1.4, margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {hospital.description}
                    </p>
                  </div>

                  <FiChevronRight
                    size={18}
                    color={isHovered ? color : '#cbd5e1'}
                    style={{
                      transition: 'all 0.3s',
                      transform: isHovered ? 'translateX(3px)' : 'none',
                      flexShrink: 0, marginTop: 4,
                    }}
                  />
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
