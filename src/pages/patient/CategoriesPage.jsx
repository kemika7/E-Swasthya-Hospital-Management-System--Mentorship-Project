import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiActivity,
  FiHeart,
  FiUser,
  FiEye,
  FiSearch,
} from 'react-icons/fi';
import {
  MdLocalHospital,
  MdChildCare,
  MdOutlineHealing,
  MdBloodtype,
} from 'react-icons/md';
import {
  FaLungs,
  FaBone,
  FaSyringe,
  FaFemale,
  FaRibbon,
  FaXRay,
  FaViruses,
  FaProcedures,
  FaAmbulance,
  FaTooth,
  FaNotesMedical,
} from 'react-icons/fa';
import { GiStomach } from 'react-icons/gi';
import { medicalCategories } from '../../data/mockData';

// Map icon strings to components
const iconMap = {
  FiActivity,
  FiHeart,
  FiUser,
  FiEye,
  MdLocalHospital,
  MdChildCare,
  MdOutlineHealing,
  MdBloodtype,
  FaLungs,
  FaBone,
  FaSyringe,
  FaFemale,
  FaRibbon,
  FaXRay,
  FaViruses,
  FaProcedures,
  FaAmbulance,
  FaTooth,
  FaNotesMedical,
  GiStomach,
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredCategories = medicalCategories.filter((category) => {
    const term = searchTerm.toLowerCase();
    const matchesCategory = category.title.toLowerCase().includes(term);
    const matchesSpecialty = category.specialties.some((s) =>
      s.name.toLowerCase().includes(term)
    );
    return matchesCategory || matchesSpecialty;
  });

  return (
    <div
      className="layout-main"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
      }}
    >
      {/* Header */}
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
          Medical Categories
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Search Bar Integration */}
      <div
        style={{
          width: '100%',
          marginBottom: '1.5rem',
          backgroundColor: 'rgba(148,163,184,0.2)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1rem',
        }}
      >
        <FiSearch size={20} style={{ color: 'rgba(15,23,42,0.5)', marginRight: '0.5rem' }} />
        <input
          type="text"
          placeholder="Search categories or specialties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: '0.95rem',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-3" style={{ gap: '1rem', paddingBottom: '2rem' }}>
        {filteredCategories.map((category) => {
          const IconComponent = iconMap[category.icon] || MdLocalHospital;
          return (
            <div
              key={category.id}
              onClick={() => navigate(`/patient/category/${category.id}`)}
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
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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
                {category.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;
