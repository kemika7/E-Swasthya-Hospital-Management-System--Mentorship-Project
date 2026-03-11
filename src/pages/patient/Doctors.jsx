import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiActivity,
  FiHeart,
  FiSmile,
  FiUser,
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { apiFetch } from '../../services/apiClient';
import doctorPlaceholder from '../../assets/images/doctor-placeholder.png';

const Doctors = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/doctors/categories');
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].id);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        padding: '1rem',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      {/* TOP HEADER BAR */}
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
          Doctors
        </div>

        <div style={{ width: 40 }} />
      </div>

      {/* CATEGORIES SECTION */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            Medical Categories
          </h2>
          <button
            type="button"
            onClick={() => navigate('/patient/categories')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            View all
          </button>
        </div>

        {/* Horizontally scrollable categories */}
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>Loading categories...</div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '0.9rem',
              overflowX: 'auto',
              overflowY: 'hidden',
              paddingBottom: '0.5rem',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigate(`/patient/category/${category.id}`)}
                  style={{
                    minWidth: 96,
                    width: 96,
                    height: 96,
                    borderRadius: 16,
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--white)',
                    boxShadow: 'var(--shadow-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                >
                  <MdLocalHospital
                    size={26}
                    style={{
                      color: isSelected ? 'var(--white)' : 'var(--text)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? 'var(--white)' : 'var(--text)',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    }}
                  >
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Doctors;
