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
  FiLogOut,
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
import { useAuth } from '../../context/AuthContext';
import { upcomingAppointment, medicalCategories } from '../../data/mockData';

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

const PatientDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

        {/* Right Side Actions: Notification & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              padding: '0.5rem',
            }}
          >
            <FiBell size={24} style={{ color: 'var(--white)' }} />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            style={{
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              color: 'var(--white)',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
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
            onClick={() => navigate('/patient/doctors')}
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
          {medicalCategories.map((category) => {
            const IconComponent = iconMap[category.icon] || FiActivity;
            return (
              <div
                key={category.id}
                onClick={() => navigate(`/patient/category/${category.id}`)}
                style={{
                  minWidth: 100,
                  width: 100,
                  height: 100,
                  backgroundColor: 'rgba(148,163,184,0.15)',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
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
                      color: 'var(--text)',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    color: 'var(--text)',
                    textAlign: 'center',
                    zIndex: 1,
                    position: 'relative',
                    padding: '0 0.5rem',
                  }}
                >
                  {category.title}
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
