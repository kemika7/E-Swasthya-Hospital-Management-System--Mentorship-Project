import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiUser,
  FiBell,
  FiHome,
  FiUsers,
  FiFileText,
  FiLock,
  FiActivity,
  FiHeart,
  FiSmile,
  FiEye,
} from 'react-icons/fi';
import { MdLocalHospital, MdChildCare, MdOutlineHealing } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { upcomingAppointment, specialistCategories } from '../../data/mockData';

// Category icons mapping - using react-icons
const categoryIcons = {
  Neurologist: FiActivity,
  Dentist: MdOutlineHealing,
  Cardiologist: FiHeart,
  Psychologist: FiSmile,
  Dermatologist: FiUser,
  Orthopedic: MdLocalHospital,
  Pediatrician: MdChildCare,
  Ophthalmologist: FiEye,
};

const PatientDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('Dentist');

  const patientName = userProfile?.name || 'Patient';

  const bottomNavItems = [
    { id: 'home', label: 'Home', icon: FiHome, path: '/patient/dashboard' },
    { id: 'doctors', label: 'Doctors', icon: FiUsers, path: '/patient/doctors' },
    { id: 'appointment', label: 'Appointment', icon: FiCalendar, path: '/patient/appointments' },
    { id: 'report-tracking', label: 'Report Tracking', icon: FiFileText, path: '/patient/reports' },
    { id: 'report', label: 'Report', icon: FiFileText, path: '/patient/reports' },
    { id: 'locker', label: 'Locker', icon: FiLock, path: '/patient/locker' },
  ];

  const isActive = (path) => {
    if (path === '/patient/dashboard') {
      return location.pathname === '/patient' || location.pathname === '/patient/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        paddingBottom: '80px', // Space for bottom nav
        padding: '1rem',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      {/* TOP HEADER SECTION */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: 16,
          padding: '1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Circular Avatar */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiUser size={24} style={{ color: 'var(--primary)' }} />
          </div>

          {/* Text Content */}
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--white)', opacity: 0.9 }}>
              Hi,
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--white)',
                marginTop: '0.15rem',
              }}
            >
              {patientName}
            </div>
          </div>
        </div>

        {/* Notification Icon */}
        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiBell size={24} style={{ color: 'var(--white)' }} />
        </button>
      </div>

      {/* SEARCH BAR SECTION */}
      <div
        style={{
          width: '100%',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
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
            placeholder="Search anything"
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

        {/* Filter Button */}
        <button
          type="button"
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: 'var(--primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <FiFilter size={20} style={{ color: 'var(--white)' }} />
        </button>
      </div>

      {/* UPCOMING APPOINTMENTS SECTION */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '1rem',
          }}
        >
          Upcoming Appointments
        </h2>

        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--primary)',
            borderRadius: 16,
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Doctor Profile Image */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiUser size={32} style={{ color: 'var(--white)' }} />
            </div>

            {/* Doctor Info */}
            <div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--white)',
                  marginBottom: '0.25rem',
                }}
              >
                {upcomingAppointment.doctorName}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--white)',
                  opacity: 0.9,
                }}
              >
                {upcomingAppointment.specialty}
              </div>
            </div>
          </div>

          {/* Date & Time Info */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {/* Date Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiCalendar size={16} style={{ color: 'var(--white)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>
                {upcomingAppointment.date}
              </span>
            </div>

            {/* Time Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiClock size={16} style={{ color: 'var(--white)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>
                {upcomingAppointment.time}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div style={{ marginBottom: '1.5rem' }}>
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
              fontSize: '1.35rem',
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

        {/* Horizontally Scrollable Categories */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
          onWheel={(e) => {
            e.preventDefault();
            e.currentTarget.scrollLeft += e.deltaY;
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          {specialistCategories.map((category) => {
            const isSelected = selectedCategory === category;
            const IconComponent = categoryIcons[category] || FiActivity;
            return (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  minWidth: 100,
                  width: 100,
                  height: 100,
                  backgroundColor: isSelected
                    ? 'var(--white)'
                    : 'rgba(148,163,184,0.15)',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 12px rgba(82,178,191,0.2)' : 'none',
                }}
              >
                {/* Highlighted background for selected category */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      opacity: 0.15,
                      zIndex: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    zIndex: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent
                    size={32}
                    style={{
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 600 : 400,
                    color: 'var(--text)',
                    textAlign: 'center',
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  {category}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--primary)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: '0.75rem 0.5rem',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100,
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                opacity: active ? 1 : 0.7,
                transform: active ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={20} style={{ color: 'var(--white)' }} />
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--white)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PatientDashboard;
