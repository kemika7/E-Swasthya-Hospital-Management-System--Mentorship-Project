import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiClock, FiFilter } from 'react-icons/fi';
import { apiFetch } from '../../services/apiClient';

const DoctorListing = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch specialties for this category
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Fetch category name from categories list
        const categories = await apiFetch('/doctors/categories');
        const cat = categories.find((c) => String(c.id) === String(categoryId));
        setCategoryName(cat ? cat.name : 'Doctors');

        // Fetch specialties for this category
        const specs = await apiFetch(`/doctors/specialties/${categoryId}`);
        setSpecialties(specs);
      } catch (err) {
        console.error('Failed to fetch category data:', err);
        setError('Failed to load category.');
      }
    };

    if (categoryId) fetchCategoryData();
  }, [categoryId]);

  // Fetch doctors whenever category or specialty selection changes
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let path = `/doctors?category_id=${categoryId}`;
        if (selectedSpecialtyId) {
          path += `&specialty_id=${selectedSpecialtyId}`;
        }
        const data = await apiFetch(path);
        setDoctors(data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchDoctors();
  }, [categoryId, selectedSpecialtyId]);

  const handleSpecialtyClick = (spec) => {
    if (spec === 'All') {
      setSelectedSpecialty('All');
      setSelectedSpecialtyId(null);
    } else {
      setSelectedSpecialty(spec.name);
      setSelectedSpecialtyId(spec.id);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        {error} <button onClick={() => navigate('/patient/doctors')}>Go Back</button>
      </div>
    );
  }

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
          {categoryName || 'Doctors'}
        </div>

        {/* Filter button */}
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
          msOverflowStyle: 'none',
        }}
      >
        <button
          onClick={() => handleSpecialtyClick('All')}
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
        {specialties.map((spec) => (
          <button
            key={spec.id}
            onClick={() => handleSpecialtyClick(spec)}
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Loading doctors...
          </div>
        ) : doctors.length > 0 ? (
          doctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/doctors/${doc.id}`)}
              style={{
                backgroundColor: 'var(--white)',
                borderRadius: 16,
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 12,
                  backgroundColor: '#f1f5f9',
                  backgroundImage: `url(${doc.image || '/images/doctor-placeholder.png'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>
                      {doc.doctor_name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                      {doc.specialty_name || doc.specialization}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: '#f0fdf4', padding: '0.2rem 0.4rem', borderRadius: 4 }}>
                    <FiStar size={12} fill="#22c55e" color="#22c55e" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>{doc.rating || '4.5'}</span>
                  </div>
                </div>

                <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <FiClock size={14} />
                    <span>{doc.experience} Years Experience</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/doctors/${doc.id}`);
                  }}
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
                  Book Appointment - NPR {doc.fee || '500'}
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
