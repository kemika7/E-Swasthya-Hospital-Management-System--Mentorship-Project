import React, { useState, useEffect } from 'react';
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

  const [dashboardData, setDashboardData] = useState({
    upcomingAppointment: null,
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const data = await apiFetch('/dashboard/patient');
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
      }}
    >
      {/* SEARCH BAR SECTION */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          gap: 'var(--space-sm)',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: 'var(--white)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.25rem',
            boxShadow: 'var(--shadow-soft)',
            border: '1px solid rgba(15, 23, 42, 0.05)',
          }}
        >
          <FiSearch size={20} style={{ color: 'var(--text-light)', marginRight: '0.75rem' }} />
          <input
            type="text"
            placeholder="Search for doctors, specialties, or reports..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '1rem',
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
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <FiFilter size={20} style={{ color: 'var(--white)' }} />
        </button>
      </div>

      {/* UPCOMING APPOINTMENTS SECTION */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            Upcoming Appointments
          </h2>
          <button
            onClick={() => navigate('/patient/appointments')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            View Schedule
          </button>
        </div>

<<<<<<< Updated upstream
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--primary)',
            borderRadius: 20,
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 12px 30px rgba(82, 178, 191, 0.25)',
            backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #469ea9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Doctor Profile Image */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiUser size={36} style={{ color: 'var(--white)' }} />
            </div>

            {/* Doctor Info */}
            <div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--white)',
                  marginBottom: '0.35rem',
                }}
              >
                {upcomingAppointment.doctorName}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  color: 'var(--white)',
                  opacity: 0.9,
                  fontWeight: 500,
                }}
              >
                {upcomingAppointment.specialty}
              </div>
            </div>
          </div>

          {/* Date & Time Info */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 16,
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {/* Date Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiCalendar size={18} style={{ color: 'var(--white)' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--white)', fontWeight: 600 }}>
                {upcomingAppointment.date}
              </span>
            </div>

            {/* Time Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiClock size={18} style={{ color: 'var(--white)' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--white)', fontWeight: 600 }}>
                {upcomingAppointment.time}
              </span>
=======
        {dashboardData.upcomingAppointment ? (
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
              <div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--white)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {dashboardData.upcomingAppointment.doctorName}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--white)', opacity: 0.9 }}>
                  {dashboardData.upcomingAppointment.specialty}
                </div>
              </div>
            </div>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiCalendar size={16} style={{ color: 'var(--white)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>
                  {dashboardData.upcomingAppointment.appointment_date}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiClock size={16} style={{ color: 'var(--white)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>
                  {dashboardData.upcomingAppointment.appointment_time}
                </span>
              </div>
>>>>>>> Stashed changes
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: 16, color: 'var(--text-secondary)' }}>
            No upcoming appointments found.
          </div>
        )}
      </div>

      {/* CATEGORIES SECTION */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            Medical Categories
          </h2>
          <button
            type="button"
            onClick={() => navigate('/patient/doctors')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            See all
          </button>
        </div>

<<<<<<< Updated upstream
        {/* Categories Grid (Standardized for Desktop) */}
=======
>>>>>>> Stashed changes
        <div
          className="grid grid-cols-4"
          style={{
<<<<<<< Updated upstream
            gap: 'var(--space-md)',
          }}
        >
          {medicalCategories.slice(0, 8).map((category) => {
            const IconComponent = iconMap[category.icon] || FiActivity;
            return (
              <div
                key={category.id}
                onClick={() => navigate(`/patient/category/${category.id}`)}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  padding: 'var(--space-lg) var(--space-md)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  textAlign: 'center',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
=======
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
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
          {loading ? (
            <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Loading categories...</div>
          ) : (
            (dashboardData.categories.length > 0 ? dashboardData.categories : medicalCategories).map((category) => {
              const IconComponent = iconMap[category.icon] || FiActivity;
              return (
>>>>>>> Stashed changes
                <div
                  key={category.id}
                  onClick={() => navigate(`/patient/category/${category.id}`)}
                  style={{
<<<<<<< Updated upstream
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    backgroundColor: 'var(--primary-light)',
=======
                    minWidth: 100,
                    width: 100,
                    height: 100,
                    backgroundColor: 'rgba(148,163,184,0.15)',
                    borderRadius: 16,
>>>>>>> Stashed changes
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
<<<<<<< Updated upstream
                  }}
                >
                  <IconComponent
                    size={28}
                    style={{
                      color: 'var(--primary)',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text)',
=======
                    gap: '0.5rem',
                    cursor: 'pointer',
                    position: 'relative',
>>>>>>> Stashed changes
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
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
