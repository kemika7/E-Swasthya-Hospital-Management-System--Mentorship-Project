import React, { useState, useEffect, useMemo } from 'react';
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
  FiStar,
  FiPhone,
  FiBriefcase,
  FiBookOpen,
  FiAlertTriangle,
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
import { useHospital } from '../../context/HospitalContext';
import ErrorDisplay from '../../components/ErrorDisplay';


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
  'Cardiology': FiHeart,
  'Neurology': FiActivity, 
  'Orthopedics': FaBone,
  'Pediatrics': MdChildCare,
  'Dermatology': MdOutlineHealing,
  'Gynecology': FaFemale,
  'Ophthalmology': FiEye,
  'ENT': MdLocalHospital, 
  'Gastroenterology': GiStomach,
  'Pulmonology': FaLungs,
};

const PatientDashboard = () => {
  const { userProfile } = useAuth();
  const { selectedHospital } = useHospital();
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboardData, setDashboardData] = useState({
    upcomingAppointment: null,
    categories: []
  });
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [doctorsError, setDoctorsError] = useState(null);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '' });
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const fetchDashboard = async () => {
    setDashboardError(null);
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const data = await apiFetch('/dashboard/patient');
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setDashboardError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    setDoctorsError(null);
    try {
      const { apiFetch } = await import('../../services/apiClient');
      let endpoint = '/doctors';
      if (selectedHospital?.id) {
        endpoint = `/doctors/hospitals/${selectedHospital.id}/doctors`;
      }
      const data = await apiFetch(endpoint);
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setDoctorsError(err.message);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedHospital]);
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const q = searchQuery.toLowerCase();
    return doctors.filter(doc => 
      (doc.doctor_name || doc.name || '').toLowerCase().includes(q) ||
      (doc.specialization || '').toLowerCase().includes(q) ||
      (doc.qualification || '').toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingDetails.date || !bookingDetails.time) {
      alert('Please select both date and time');
      return;
    }
    setIsBookingSubmitting(true);
    try {
      const { apiFetch } = await import('../../services/apiClient');
      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          hospitalId: selectedHospital?.id || selectedDoctor.hospital_id,
          date: bookingDetails.date,
          time: bookingDetails.time,
        })
      });
      alert('Appointment booked successfully! It will appear in your dashboard after approval.');
      setIsBookingModalOpen(false);
      setBookingDetails({ date: '', time: '' });
      fetchDashboard(); // Refresh upcoming appointments if needed
    } catch (err) {
      alert('Failed to book appointment: ' + err.message);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* SEARCH BAR SECTION */}
      <div style={{ width: '100%', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        <div style={{
          flex: 1, position: 'relative', backgroundColor: 'var(--white)', borderRadius: 12,
          display: 'flex', alignItems: 'center', padding: '0.75rem 1.25rem',
          boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15, 23, 42, 0.05)',
        }}>
          <FiSearch size={20} style={{ color: 'var(--text-light)', marginRight: '0.75rem' }} />
          <input
            type="text"
            placeholder={`Search doctors in ${selectedHospital?.name || 'hospital'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '1rem', color: 'var(--text)' }}
          />
        </div>
        <button type="button" style={{
          width: 48, height: 48, borderRadius: 12, backgroundColor: 'var(--primary)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
        }}>
          <FiFilter size={20} style={{ color: 'var(--white)' }} />
        </button>
      </div>

      {/* UPCOMING APPOINTMENTS SECTION */}
      <div>
        {dashboardError && (
          <div style={{ marginBottom: '1.5rem' }}>
            <ErrorDisplay 
              message={`Failed to load dashboard data: ${dashboardError}`} 
              onRetry={fetchDashboard} 
            />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Upcoming Appointments</h2>
          <button onClick={() => navigate('/patient/appointments')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            View Schedule
          </button>
        </div>

        {dashboardData.upcomingAppointment ? (
          <div style={{ width: '100%', backgroundColor: 'var(--primary)', borderRadius: 16, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser size={32} style={{ color: 'var(--white)' }} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--white)', marginBottom: '0.25rem' }}>{dashboardData.upcomingAppointment.doctorName}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--white)', opacity: 0.9 }}>{dashboardData.upcomingAppointment.specialty}</div>
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiCalendar size={16} style={{ color: 'var(--white)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{formatDate(dashboardData.upcomingAppointment.date)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiClock size={16} style={{ color: 'var(--white)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{formatTime(dashboardData.upcomingAppointment.time)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: 16, color: 'var(--text-secondary)' }}>
            No upcoming appointments found.
          </div>
        )}
      </div>

      {/* HEALTH TRACKER QUICK ACCESS */}
      <div 
        onClick={() => navigate('/patient/reports')}
        style={{ 
          width: '100%', padding: '1.25rem', backgroundColor: 'var(--white)', borderRadius: 16,
          boxShadow: 'var(--shadow-soft)', cursor: 'pointer', border: '1px solid rgba(15, 23, 42, 0.05)',
          display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          <FiActivity size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Health Tracker</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>Monitor your vitals, weight, and daily habits.</p>
        </div>
        <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.25rem' }}>→</div>
      </div>

      {/* CATEGORIES SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Medical Categories</h2>
          <button type="button" onClick={() => navigate('/patient/doctors')} style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
            See all
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }} onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {(dashboardData.categories || []).map((category) => {
            const IconComponent = iconMap[category.name] || iconMap[category.title] || iconMap[category.icon] || FiActivity;
            return (
              <div key={category.id} onClick={() => navigate(`/patient/category/${category.id}`)} style={{ minWidth: 100, width: 100, height: 100, backgroundColor: 'rgba(148,163,184,0.15)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <IconComponent size={32} style={{ color: 'var(--text)' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text)', textAlign: 'center', padding: '0 0.5rem' }}>{category.title || category.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DOCTORS SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
            Available Doctors in {selectedHospital?.name || 'All Hospitals'}
          </h2>
          <button 
            type="button" 
            onClick={() => navigate('/patient/hospitals')} 
            className="btn btn-outline"
            style={{ 
              fontSize: '0.85rem', 
              padding: '0.5rem 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              color: 'var(--primary)',
              borderColor: 'var(--primary)'
            }}
          >
            {selectedHospital ? 'Change Hospital' : 'Select Hospital'}
          </button>
        </div>

        {doctorsError ? (
          <ErrorDisplay 
            message={doctorsError} 
            onRetry={fetchDoctors} 
            style={{ margin: '1rem 0' }}
          />
        ) : doctorsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading doctors...</div>
        ) : filteredDoctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: 'var(--white)', borderRadius: 16, padding: '1.25rem',
                  boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15, 23, 42, 0.05)',
                  transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 12, backgroundColor: 'rgba(82,178,191,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                  }}>
                    <FiUser size={30} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{doc.doctor_name || doc.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>{doc.specialization}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: 8 }}>
                    <FiStar size={12} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>{doc.rating || '4.5'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiBookOpen size={14} /> <span>{doc.qualification || 'MBBS'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiBriefcase size={14} /> <span>{doc.experience} yrs exp</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', gridColumn: 'span 2' }}>
                    <FiPhone size={14} /> <span>{doc.phone || 'Contact Support'}</span>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedDoctor(doc); setIsBookingModalOpen(true); }}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: 12, backgroundColor: 'var(--primary)',
                    color: 'var(--white)', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem'
                  }}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: 16, color: 'var(--text-secondary)' }}>
            <FiUsers size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>{searchQuery ? 'No doctors match your search.' : 'No doctors available in this hospital yet.'}</p>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--white)', width: '90%', maxWidth: 450, borderRadius: 24, padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Book Appointment</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Booking for <strong style={{ color: 'var(--primary)' }}>{selectedDoctor?.doctor_name || selectedDoctor?.name}</strong>
            </p>

            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Select Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                  style={{
                    padding: '0.85rem', borderRadius: 12, border: '1px solid #e2e8f0',
                    outline: 'none', fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Select Time</label>
                <input
                  type="time"
                  required
                  value={bookingDetails.time}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                  style={{
                    padding: '0.85rem', borderRadius: 12, border: '1px solid #e2e8f0',
                    outline: 'none', fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  style={{
                    flex: 1, padding: '0.85rem', borderRadius: 12, backgroundColor: '#f1f5f9',
                    color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBookingSubmitting}
                  style={{
                    flex: 1, padding: '0.85rem', borderRadius: 12, backgroundColor: 'var(--primary)',
                    color: 'var(--white)', border: 'none', fontWeight: 600, cursor: 'pointer',
                    opacity: isBookingSubmitting ? 0.7 : 1
                  }}
                >
                  {isBookingSubmitting ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
