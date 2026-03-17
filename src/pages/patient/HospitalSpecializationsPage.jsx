import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone, FiActivity, FiHeart, FiUser, FiEye } from 'react-icons/fi';
import { MdLocalHospital, MdChildCare, MdOutlineHealing, MdBloodtype } from 'react-icons/md';
import { FaLungs, FaBone, FaSyringe, FaFemale, FaRibbon, FaXRay, FaViruses, FaProcedures, FaAmbulance, FaTooth, FaNotesMedical } from 'react-icons/fa';
import { GiStomach } from 'react-icons/gi';
import { apiFetch } from '../../services/apiClient';
import HospitalDoctorCard from '../../components/HospitalDoctorCard';

const ICON_MAP = {
  Cardiology: FiHeart,
  Neurology: FiActivity,
  Orthopedics: FaBone,
  Pediatrics: MdChildCare,
  Dermatology: MdOutlineHealing,
  Gynecology: FaFemale,
  Ophthalmology: FiEye,
  ENT: MdLocalHospital,
  Gastroenterology: GiStomach,
  Pulmonology: FaLungs,
  Dental: FaTooth,
  default: FiActivity,
};

const getIcon = (name) => {
  if (!name) return ICON_MAP.default;
  const key = Object.keys(ICON_MAP).find(
    k => name.toLowerCase().includes(k.toLowerCase())
  );
  return ICON_MAP[key] || ICON_MAP.default;
};

const HospitalSpecializationsPage = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch necessary metadata in parallel
        const [hospitalsRes, categoriesRes] = await Promise.all([
          apiFetch('/doctors/hospitals'),
          apiFetch('/doctors/categories')
        ]);

        const foundHospital = hospitalsRes.find(h => String(h.id) === String(hospitalId));
        setHospital(foundHospital || null);
        setCategories(categoriesRes || []);
      } catch (err) {
        console.error('Failed to fetch hospital details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hospitalId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e2e8f0',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          Loading Departments...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Hospital Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        borderRadius: 24,
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        
        <button
          onClick={() => navigate('/patient/hospitals')}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: 'none', backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: '1.5rem', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        >
          <FiArrowLeft size={20} color="#fff" />
        </button>

        {hospital ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>{hospital.name}</h1>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                    <FiMapPin size={16} /> <span>{hospital.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                    <FiPhone size={16} /> <span>{hospital.phone || 'Contact Support'}</span>
                  </div>
                </div>
              </div>
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '0.4rem 1rem',
                borderRadius: 100,
                fontSize: '0.8rem',
                fontWeight: 700,
                backdropFilter: 'blur(10px)',
                textTransform: 'uppercase'
              }}>
                {hospital.type || 'General'}
              </span>
            </div>
          </div>
        ) : (
          <h2>Hospital not found</h2>
        )}
      </div>

      {/* Specializations Section */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>Medical Departments</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Select a department to view available specialists</p>
        </div>
        
        {categories.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--white)', 
            borderRadius: 24, border: '2px dashed #e2e8f0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
              <MdLocalHospital size={32} />
            </div>
            <h3 style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>No medical categories found for this hospital.</h3>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {categories.map(cat => {
              const IconComponent = getIcon(cat.name);
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/patient/hospital/${hospitalId}/category/${cat.id}/doctors`)}
                  style={{
                    backgroundColor: 'var(--white)',
                    borderRadius: 16,
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '0.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #f1f5f9',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(82,178,191,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(82,178,191,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}>
                    <IconComponent size={28} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: 700, 
                      color: 'var(--text)', 
                      margin: 0, 
                      lineHeight: '1.3' 
                    }}>
                      {cat.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HospitalSpecializationsPage;
