import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiStar, FiBriefcase, FiPhone } from 'react-icons/fi';

const HospitalDoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/patient/doctor/${doctor.id}`)}
      style={{
        backgroundColor: 'var(--white)',
        borderRadius: 16,
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(82,178,191,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
        flexShrink: 0
      }}>
        <FiUser size={24} />
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', 
          margin: '0 0 0.1rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
        }}>
          {doctor.doctor_name || doctor.name}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{doctor.specialization}</span>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
            <FiStar size={10} fill="#f59e0b" color="#f59e0b" />
            <span>{doctor.rating || '4.5'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
           <FiBriefcase size={12} />
           <span>{doctor.experience}+ yrs</span>
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
          NPR {doctor.fee || '500'}
        </div>
      </div>
    </div>
  );
};

export default HospitalDoctorCard;
