import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronRight, FiMapPin } from 'react-icons/fi';
import { useHospital } from '../../context/HospitalContext';


const SelectHospitalPage = () => {
  const navigate = useNavigate();
  const { setSelectedHospital } = useHospital();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [error, setError] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const data = await apiFetch('/doctors/hospitals');
        // Map database fields to UI fields (icon/color)
        const mapped = data.map((h, idx) => ({
          ...h,
          icon: ['🏥', '🏨', '🩺', '💊', '🧬', '🫀', '🧠'][idx % 7],
          color: ['#52b2bf', '#22c55e', '#f59e0b', '#6366f1', '#ec4899'][idx % 5]
        }));
        setHospitals(mapped);
      } catch (err) {
        console.error('Failed to fetch hospitals:', err);
        setError('Failed to load hospitals. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.location && h.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (hospital) => {
    try {
      setSelectedHospital({ id: hospital.id, name: hospital.name });
      navigate('/patient/dashboard');
    } catch {
      setError('Failed to save hospital selection. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100%', backgroundColor: 'var(--background)' }}>

      {/* Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
        borderRadius: 20,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 130, height: 130, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -25, left: '35%',
          width: 90, height: 90, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />

        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: '0 0 0.2rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
          Welcome
        </p>
        <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          🏥 Select Your Hospital
        </h1>
        {location.state?.from && (
          <p style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.9rem', marginBottom: '1rem' }}>
            Please select a hospital to continue to your requested page.
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Please select your hospital to continue to your dashboard
        </p>


        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 12, padding: '0.6rem 1rem',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <FiSearch size={18} color="rgba(255,255,255,0.7)" />
          <input
            type="text"
            placeholder="Search hospitals or locations…"
            value={search}
            onChange={e => { setSearch(e.target.value); setError(''); }}
            aria-label="Search hospitals"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', color: '#fff',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 12,
          backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444',
          fontSize: '0.9rem', marginBottom: '1rem',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          {error}
        </div>
      )}

      {/* Hospital Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
          <p>No hospitals found matching "{search}"</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((hospital) => {
            const isHovered = hoveredId === hospital.id;
            return (
              <div
                key={hospital.id}
                onClick={() => handleSelect(hospital)}
                onMouseEnter={() => setHoveredId(hospital.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${hospital.name}`}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(hospital)}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 16,
                  padding: '1.2rem',
                  cursor: 'pointer',
                  boxShadow: isHovered
                    ? `0 8px 30px ${hospital.color}30`
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  border: `1px solid ${isHovered ? hospital.color + '50' : '#f1f5f9'}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  outline: 'none',
                }}
              >
                {/* Accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${hospital.color}, ${hospital.color}88)`,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s',
                }} />

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {/* Icon */}
                  <div style={{
                    width: 54, height: 54, borderRadius: 14,
                    background: `${hospital.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', flexShrink: 0,
                    transition: 'transform 0.3s',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    {hospital.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '0.95rem', fontWeight: 600,
                      color: 'var(--text)', marginBottom: '0.3rem',
                      lineHeight: 1.3,
                    }}>
                      {hospital.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FiMapPin size={13} color="#94a3b8" />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{hospital.location}</span>
                    </div>
                  </div>

                  <FiChevronRight
                    size={20}
                    color={isHovered ? hospital.color : '#cbd5e1'}
                    style={{
                      transition: 'all 0.3s',
                      transform: isHovered ? 'translateX(3px)' : 'none',
                      flexShrink: 0,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  );
};

export default SelectHospitalPage;
