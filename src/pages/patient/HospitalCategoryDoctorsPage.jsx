import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiActivity, FiHeart, FiEye, FiPhone, FiBookOpen, FiBriefcase, FiStar } from 'react-icons/fi';
import { MdLocalHospital, MdChildCare, MdOutlineHealing } from 'react-icons/md';
import { FaLungs, FaBone, FaFemale, FaTooth } from 'react-icons/fa';
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

const HospitalCategoryDoctorsPage = () => {
  const { hospitalId, categoryId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [category, setCategory] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data in parallel
        const [hospitalsRes, categoriesRes, doctorsRes] = await Promise.all([
          apiFetch('/doctors/hospitals'),
          apiFetch('/doctors/categories'),
          apiFetch(`/doctors?hospital_id=${hospitalId}&category_id=${categoryId}`)
        ]);

        const foundHospital = hospitalsRes.find(h => String(h.id) === String(hospitalId));
        const foundCategory = categoriesRes.find(c => String(c.id) === String(categoryId));
        
        setHospital(foundHospital || null);
        setCategory(foundCategory || null);
        setDoctors(doctorsRes || []);
      } catch (err) {
        console.error('Failed to fetch filtered doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hospitalId, categoryId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e2e8f0',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          Fetching Specialists...
        </div>
      </div>
    );
  }

  const IconComponent = category ? getIcon(category.name) : ICON_MAP.default;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #3aa0ad 100%)',
        borderRadius: 24,
        padding: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ position: 'absolute', top: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        
        <button
          onClick={() => navigate(`/patient/hospital/${hospitalId}`)}
          style={{
            width: 44, height: 44, borderRadius: 14,
            border: 'none', backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: '2rem', transition: 'all 0.2s',
            backdropFilter: 'blur(5px)'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        >
          <FiArrowLeft size={22} color="#fff" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}>
            <IconComponent size={40} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {category?.name || 'Medical Department'}
            </h1>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '1.1rem', opacity: 0.9, fontWeight: 500 }}>
              {hospital?.name || 'Loading Hospital...'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>Available Specialists</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>
            {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} found
          </span>
        </div>

        {doctors.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--white)', 
            borderRadius: 24, border: '2px dashed #e2e8f0', color: 'var(--text-secondary)'
          }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', margin: '0 auto 1.5rem' }}>
              <FiUser size={40} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>No doctors available in this category.</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem', color: '#94a3b8' }}>
              We couldn't find any specialists for {category?.name} at {hospital?.name} currently.
            </p>
            <button 
              onClick={() => navigate(`/patient/hospital/${hospitalId}`)}
              style={{
                marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: 12,
                backgroundColor: 'var(--primary)', color: '#fff', border: 'none',
                fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Browse other departments
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {doctors.map(doc => (
              <HospitalDoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HospitalCategoryDoctorsPage;
