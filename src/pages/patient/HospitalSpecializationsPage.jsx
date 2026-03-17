import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone } from 'react-icons/fi';
import { apiFetch } from '../../services/apiClient';
import DoctorCategories from '../../components/DoctorCategories';

const HospitalSpecializationsPage = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch('/doctors/hospitals');
        const found = data.find(h => String(h.id) === String(hospitalId));
        setHospital(found || null);
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
          Doctor Categories
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Select a category to view available doctors
        </p>
      </div>

      <DoctorCategories
        hospitalId={hospitalId}
        hospitalName={hospital?.name}
      />

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
