import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiClock, FiMapPin, FiFilter } from 'react-icons/fi';
import { medicalCategories, doctors } from '../../data/mockData';

const DoctorListing = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const category = medicalCategories.find((c) => c.id === categoryId);
  
  const categoryDoctors = doctors.filter((doc) => {
    const matchCategory = doc.categoryId === categoryId;
    const matchSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchCategory && matchSpecialty;
  });

  // If category not found, handle gracefully (redirect or show error)
  if (!category) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Category not found. <button onClick={() => navigate('/patient/doctors')}>Go Back</button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        padding: '1rem',
        maxWidth: 600,
        margin: '0 auto',
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
          onClick={() => navigate('/patient/doctors')}
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
            fontSize: '1.1rem',
            fontWeight: 600,
            padding: '0 0.5rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {category.title}
        </div>
        
        {/* Filter button placeholder */}
        <button
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
          <FiFilter size={18} style={{ color: 'var(--white)' }} />
        </button>
      </div>

      {/* Specialties Tags (Horizontal Scroll) */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginBottom: '0.5rem',
          scrollbarWidth: 'none',
        }}
      >
        <button
          onClick={() => setSelectedSpecialty('All')}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: 20,
            border: selectedSpecialty === 'All' ? 'none' : '1px solid #e2e8f0',
            backgroundColor: selectedSpecialty === 'All' ? 'var(--primary)' : 'var(--white)',
            color: selectedSpecialty === 'All' ? 'var(--white)' : 'var(--text)',
            fontSize: '0.85rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {category.specialties.map((spec) => (
          <button
            key={spec.id}
            onClick={() => setSelectedSpecialty(spec.name)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 20,
              border: selectedSpecialty === spec.name ? 'none' : '1px solid #e2e8f0',
              backgroundColor: selectedSpecialty === spec.name ? 'var(--primary)' : 'var(--white)',
              color: selectedSpecialty === spec.name ? 'var(--white)' : 'var(--text)',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {spec.name}
          </button>
        ))}
      </div>

      {/* Doctors List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {categoryDoctors.length > 0 ? (
          categoryDoctors.map((doc) => (
            <div
              key={doc.id}
              style={{
                backgroundColor: 'var(--white)',
                borderRadius: 16,
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 12,
                  backgroundColor: '#f1f5f9',
                  backgroundImage: `url(https://i.pravatar.cc/150?u=${doc.id})`, // Placeholder
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>
                      {doc.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                      {doc.specialty}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: '#f0fdf4', padding: '0.2rem 0.4rem', borderRadius: 4 }}>
                    <FiStar size={12} fill="#22c55e" color="#22c55e" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>{doc.rating}</span>
                  </div>
                </div>

                <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                     <FiClock size={14} />
                     <span>{doc.experience} exp</span>
                     <span style={{ margin: '0 0.2rem' }}>•</span>
                     <span>Next: {doc.nextAvailable}</span>
                   </div>
                </div>

                <button
                  style={{
                    width: '100%',
                    marginTop: '0.8rem',
                    padding: '0.5rem',
                    borderRadius: 8,
                    border: '1px solid var(--primary)',
                    backgroundColor: 'transparent',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <p>No doctors found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorListing;
