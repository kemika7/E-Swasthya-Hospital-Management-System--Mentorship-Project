import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiHeart, FiUser, FiEye, FiPhone, FiBookOpen,
} from 'react-icons/fi';
import {
  MdLocalHospital, MdChildCare, MdOutlineHealing, MdBloodtype,
} from 'react-icons/md';
import {
  FaLungs, FaBone, FaSyringe, FaFemale, FaRibbon, FaXRay, FaViruses, FaProcedures, FaAmbulance, FaTooth, FaNotesMedical,
} from 'react-icons/fa';
import { GiStomach } from 'react-icons/gi';
import { apiFetch } from '../services/apiClient';

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
  Oncology: FaRibbon,
  Radiology: FaXRay,
  Infectious: FaViruses,
  Surgery: FaProcedures,
  Emergency: FaAmbulance,
  Dental: FaTooth,
  General: FaNotesMedical,
  Blood: MdBloodtype,
  default: FiActivity,
};

const getIcon = (name) => {
  if (!name) return ICON_MAP.default;
  const key = Object.keys(ICON_MAP).find(
    k => name.toLowerCase().includes(k.toLowerCase())
  );
  return ICON_MAP[key] || ICON_MAP.default;
};

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
  Dental:           { icon: '🦷', color: '#0ea5e9', bg: '#f0f9ff' },
  default:          { icon: '⚕️', color: '#64748b', bg: '#f8fafc' }
};

const getSpecConfig = (name) => {
  if (!name) return SPEC_CONFIG.default;
  const key = Object.keys(SPEC_CONFIG).find(
    k => name.toLowerCase().includes(k.toLowerCase())
  );
  return SPEC_CONFIG[key] || SPEC_CONFIG.default;
};

/**
 * DoctorCategories
 * Props:
 *   hospitalId  — number | null. When null, shows a "select hospital" prompt.
 *   hospitalName — string, used in the subtitle.
 *   onSelectHospital — callback to open the hospital picker (optional).
 */
const DoctorCategories = ({ hospitalId, hospitalName, onSelectHospital }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredSpec, setHoveredSpec] = useState(null);

  useEffect(() => {
    if (!hospitalId) {
      setCategories([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(`/dashboard/categories?hospital_id=${hospitalId}`);
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          console.error('DoctorCategories fetch failed:', err);
          setError(err.message);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => { cancelled = true; };
  }, [hospitalId]);

  if (!hospitalId) {
    return (
      <div
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--primary-light)',
          border: '2px dashed var(--primary)',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
            boxShadow: '0 4px 12px rgba(82, 178, 191, 0.2)'
          }}
        >
          <MdLocalHospital size={28} />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>
            Select a Hospital First
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            Doctor categories will appear here once you select a hospital.
          </div>
        </div>
        {onSelectHospital && (
          <button
            onClick={onSelectHospital}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: 12,
              backgroundColor: 'var(--primary)',
              color: 'var(--white)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Choose a Hospital
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '0.8rem',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: 100,
              borderRadius: 16,
              backgroundColor: '#f1f5f9',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: '#fff5f5',
          borderRadius: 20,
          border: '2px dashed #fed7d7',
          color: '#c53030',
        }}
      >
        Failed to load categories. Please try again.
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩺</p>
        <p>No specializations found for this hospital.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-md)',
      }}
    >
      {categories.map((cat) => {
        const IconComponent = getIcon(cat.name);
        const isHovered = hoveredSpec === cat.id;

        return (
          <div
            key={cat.id}
            onClick={() => navigate(`/patient/hospital/${hospitalId}/doctors?spec=${encodeURIComponent(cat.name)}`)}
            onMouseEnter={() => setHoveredSpec(cat.id)}
            onMouseLeave={() => setHoveredSpec(null)}
            style={{
              backgroundColor: 'var(--white)',
              borderRadius: 16,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(82,178,191,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComponent size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text)',
                lineHeight: '1.3',
              }}
            >
              {cat.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};


export default DoctorCategories;
