import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiClock, FiFilter, FiMapPin } from 'react-icons/fi';
import { apiFetch } from '../../services/apiClient';

const DoctorListing = () => {
  const { categoryId, hospitalId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isHospitalMode = !!hospitalId;
  const initialSpec = searchParams.get('spec') || 'All';

  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch category data (original mode)
  useEffect(() => {
    if (!categoryId || isHospitalMode) return;
    const fetchCategoryData = async () => {
      try {
        const categories = await apiFetch('/doctors/categories');
        const cat = categories.find((c) => String(c.id) === String(categoryId));
        setCategoryName(cat ? cat.name : 'Doctors');
        const specs = await apiFetch(`/doctors/specialties/${categoryId}`);
        setSpecialties(specs);
      } catch (err) {
        console.error('Failed to fetch category data:', err);
        setError('Failed to load category.');
      }
    };
    fetchCategoryData();
  }, [categoryId, isHospitalMode]);

  // Fetch hospital data (hospital mode)
  useEffect(() => {
    if (!isHospitalMode) return;
    const fetchHospitalData = async () => {
      try {
        const [hospitals, specs] = await Promise.all([
          apiFetch('/doctors/hospitals'),
          apiFetch(`/doctors/hospitals/${hospitalId}/specializations`),
        ]);
        const hosp = hospitals.find(h => String(h.id) === String(hospitalId));
        setHospitalName(hosp ? hosp.name : 'Hospital');
        setSpecializations(specs);
      } catch (err) {
        console.error('Failed to fetch hospital data:', err);
        setError('Failed to load hospital data.');
      }
    };
    fetchHospitalData();
  }, [hospitalId, isHospitalMode]);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let path;
        if (isHospitalMode) {
          path = `/doctors/hospitals/${hospitalId}/doctors`;
          if (selectedSpecialty && selectedSpecialty !== 'All') {
            path += `?specialization=${encodeURIComponent(selectedSpecialty)}`;
          }
        } else {
          path = `/doctors?category_id=${categoryId}`;
          if (selectedSpecialtyId) {
            path += `&specialty_id=${selectedSpecialtyId}`;
          }
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

    if (isHospitalMode || categoryId) fetchDoctors();
  }, [categoryId, hospitalId, isHospitalMode, selectedSpecialtyId, selectedSpecialty]);

  const handleSpecialtyClick = (spec) => {
    if (spec === 'All') {
      setSelectedSpecialty('All');
      setSelectedSpecialtyId(null);
    } else if (isHospitalMode) {
      setSelectedSpecialty(spec);
    } else {
      setSelectedSpecialty(spec.name);
      setSelectedSpecialtyId(spec.id);
    }
  };

  const headerTitle = isHospitalMode ? hospitalName : (categoryName || 'Doctors');
  const backPath = isHospitalMode
    ? `/patient/hospital/${hospitalId}`
    : '/patient/doctors';
  const specList = isHospitalMode ? specializations : specialties;

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        {error} <button onClick={() => navigate(backPath)}>Go Back</button>
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
          background: isHospitalMode
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            : 'var(--primary)',
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
          onClick={() => navigate(backPath)}
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
          {headerTitle}
        </div>

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
        {specList.map((spec, idx) => {
          const label = isHospitalMode ? spec : spec.name;
          const key = isHospitalMode ? spec : spec.id;
          return (
            <button
              key={key}
              onClick={() => handleSpecialtyClick(spec)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 20,
                border: selectedSpecialty === label ? 'none' : '1px solid #e2e8f0',
                backgroundColor: selectedSpecialty === label ? 'var(--primary)' : 'var(--white)',
                color: selectedSpecialty === label ? 'var(--white)' : 'var(--text)',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Doctors List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid #e2e8f0',
              borderTopColor: 'var(--primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 0.8rem',
            }} />
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
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  flexShrink: 0,
                }}
              >
                {!doc.image && '👨‍⚕️'}
              </div>

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

                <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <FiClock size={14} />
                    <span>{doc.experience} Yrs Exp</span>
                  </div>
                  {doc.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <FiMapPin size={14} />
                      <span>{doc.location}</span>
                    </div>
                  )}
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
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.backgroundColor = 'var(--primary)'; e.target.style.color = '#fff'; }}
                  onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--primary)'; }}
                >
                  Book Appointment - NPR {doc.fee || '500'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩺</p>
            <p>No doctors found{selectedSpecialty !== 'All' ? ` in ${selectedSpecialty}` : ''}.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DoctorListing;
