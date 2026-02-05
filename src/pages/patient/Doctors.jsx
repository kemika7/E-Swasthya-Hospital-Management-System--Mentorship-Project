import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiActivity,
  FiHeart,
  FiSmile,
  FiUser,
} from 'react-icons/fi';
import { MdOutlineHealing } from 'react-icons/md';
import { specialistCategories } from '../../data/mockData';
import doctorPlaceholder from '../../assets/images/doctor-placeholder.png';

// Category icons mapping using react-icons
const categoryIcons = {
  Neurologist: FiActivity,
  Dentist: MdOutlineHealing,
  Cardiologist: FiHeart,
  Psychologist: FiSmile,
  Dermatologist: FiUser,
};

const Doctors = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Dentist');

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

        {/* Right spacer to balance layout */}
        <div style={{ width: 40 }} />
      </div>

      {/* RECENTLY BOOKED DOCTORS SECTION */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.9rem',
          }}
        >
          Recently Booked Doctors
        </h2>

        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--white)',
            borderRadius: 16,
            padding: '0.9rem',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          {/* Doctor image container */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: 'var(--background)',
              flexShrink: 0,
            }}
          >
            <img
              src={doctorPlaceholder}
              alt="Dr. Manoj Thapa"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Doctor info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.3rem',
            }}
          >
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              Dr. Manoj Thapa
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)', opacity: 0.8 }}>
              Dentist
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                color: 'var(--text)',
                opacity: 0.8,
              }}
            >
              <FiMapPin size={14} />
              <span>Kathmandu, Nepal</span>
            </div>
          </div>
        </div>
      </section>

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
            Categories
          </h2>
          <button
            type="button"
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
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {specialistCategories
            .filter((c) =>
              ['Neurologist', 'Dentist', 'Cardiologist', 'Psychologist', 'Dermatologist'].includes(
                c
              )
            )
            .map((category) => {
              const IconComponent = categoryIcons[category] || FiActivity;
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    minWidth: 96,
                    width: 96,
                    height: 96,
                    borderRadius: 16,
                    border: 'none',
                    backgroundColor: 'var(--white)',
                    boxShadow: 'var(--shadow-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0.5rem',
                  }}
                >
                  {/* Highlight for Dentist specifically */}
                  {category === 'Dentist' && (
                    <div
                      style={{
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        opacity: 0.12,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                  <IconComponent
                    size={26}
                    style={{
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      zIndex: 1,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 600 : 400,
                      color: 'var(--text)',
                      zIndex: 1,
                    }}
                  >
                    {category}
                  </span>
                </button>
              );
            })}
        </div>
      </section>
    </main>
  );
};

export default Doctors;

