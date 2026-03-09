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
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
      }}
    >
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h1 className="page-title">Medical Categories</h1>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <FiSearch
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
            }}
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-4" style={{ gap: 'var(--space-md)', paddingBottom: '2rem' }}>
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
