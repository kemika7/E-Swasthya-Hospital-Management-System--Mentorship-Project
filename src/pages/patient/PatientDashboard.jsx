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
  FiMapPin,
  FiCheckCircle,
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
import DoctorCategories from '../../components/DoctorCategories';


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
  const { selectedHospital, setSelectedHospital } = useHospital();
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
  const [hospitals, setHospitals] = useState([]);
  const [isHospitalSelectorOpen, setIsHospitalSelectorOpen] = useState(false);

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
    const fetchHospitals = async () => {
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const data = await apiFetch('/doctors/hospitals');
        setHospitals(data);
      } catch (err) {
        console.error('Failed to fetch hospitals:', err);
      }
    };
    fetchHospitals();
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
      (doc.qualification || '').toLowerCase().includes(q) ||
      (doc.hospital_name || '').toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedHospital) {
      if (window.confirm('Please select a hospital from the Hospital section first. Would you like to go there now?')) {
        navigate('/patient/hospitals', { state: { from: location } });
      }
      return;
    }
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

      {/* SEARCH RESULTS (ELEVATED) */}
      {searchQuery.trim() && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
              Search Results
            </h2>
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Clear Search
            </button>
          </div>
          {filteredDoctors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/patient/doctor/${doc.id}`)}
                  style={{
                    backgroundColor: 'var(--white)', borderRadius: 16, padding: '1.25rem',
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--primary)',
                    transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    cursor: 'pointer', position: 'relative'
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
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{doc.doctor_name || doc.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{doc.specialization || 'General'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <FiHome size={12} /> {doc.hospital_name || 'General Hospital'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 16, border: '1px dashed #ef4444' }}>
              <FiAlertTriangle size={32} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
              <p style={{ color: '#ef4444', fontWeight: 500 }}>No results found for "{searchQuery}"</p>
            </div>
          )}
          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
        </div>
      )}

      {/* TOP ROW: Appointments & Tracker */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-lg)', 
        flexWrap: 'wrap',
        alignItems: 'stretch'
      }}>
        {/* UPCOMING APPOINTMENTS SECTION */}
        <div style={{ flex: '1 1 400px' }}>
          {dashboardError && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ErrorDisplay 
                message={`Failed to load dashboard data: ${dashboardError}`} 
                onRetry={fetchDashboard} 
              />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Upcoming Appointments</h2>
            <button onClick={() => navigate('/patient/appointments')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              View Schedule
            </button>
          </div>

          {dashboardData.upcomingAppointment ? (
            <div style={{ width: '100%', height: 'calc(100% - 2.5rem)', backgroundColor: 'var(--primary)', borderRadius: 20, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiUser size={28} style={{ color: 'var(--white)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--white)', marginBottom: '0.2rem' }}>{dashboardData.upcomingAppointment.doctorName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--white)', opacity: 0.85 }}>{dashboardData.upcomingAppointment.specialty}</div>
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiCalendar size={15} style={{ color: 'var(--white)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--white)', fontWeight: 500 }}>{formatDate(dashboardData.upcomingAppointment.date)}</span>
                </div>
                <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiClock size={15} style={{ color: 'var(--white)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--white)', fontWeight: 500 }}>{formatTime(dashboardData.upcomingAppointment.time)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: 'calc(100% - 2.5rem)', padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 20, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <FiCalendar size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <span style={{ fontSize: '0.9rem' }}>No upcoming appointments.</span>
            </div>
          )}
        </div>

        {/* HEALTH TRACKER QUICK ACCESS */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--space-sm)' }}>Health Overview</h2>
          <div 
            onClick={() => navigate('/patient/reports')}
            style={{ 
              height: 'calc(100% - 2.5rem)', padding: '1.5rem', backgroundColor: 'var(--white)', borderRadius: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', border: '1px solid #f1f5f9',
              display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(82,178,191,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <FiActivity size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Personal Health Tracker</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Monitor vitals & daily habits</p>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.8rem',
              marginTop: '0.5rem'
            }}>
              <div style={{ padding: '0.6rem', borderRadius: 12, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Steps</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>8,432</div>
              </div>
              <div style={{ padding: '0.6rem', borderRadius: 12, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Sleep</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>7.5h</div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginTop: '0.5rem'
            }}>
              <span>View full report</span>
              <FiBriefcase size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>Doctor Categories</h2>
            {selectedHospital && (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Specializations at {selectedHospital.name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/patient/doctors')}
            style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
          >
            See all
          </button>
        </div>

        {/* DoctorCategories receives hospitalId as a prop — fully reactive */}
        <DoctorCategories
          hospitalId={selectedHospital?.id || null}
          hospitalName={selectedHospital?.name || ''}
          onSelectHospital={() => setIsHospitalSelectorOpen(true)}
        />
      </div>

      {/* DOCTORS SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
            Available Doctors in {selectedHospital?.name || 'All Hospitals'}
          </h2>
          <button 
            type="button" 
            onClick={() => setIsHospitalSelectorOpen(!isHospitalSelectorOpen)} 
            className="btn btn-outline"
            style={{ 
              fontSize: '0.85rem', 
              padding: '0.5rem 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              color: 'var(--primary)',
              borderColor: 'var(--primary)',
              borderRadius: 10,
              backgroundColor: isHospitalSelectorOpen ? 'rgba(82, 178, 191, 0.05)' : 'transparent'
            }}
          >
            {selectedHospital ? (
              <><MdLocalHospital size={16} /> {selectedHospital.name}</>
            ) : (
              'Select Hospital'
            )}
            <FiFilter size={14} style={{ marginLeft: '0.2rem', transform: isHospitalSelectorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
        </div>

        {/* COMPACT HOSPITAL SELECTOR (COLLAPSIBLE) */}
        {isHospitalSelectorOpen && (
          <div style={{ 
            backgroundColor: 'var(--primary-light)', 
            borderRadius: 24, 
            padding: '1.5rem', 
            marginBottom: '1.5rem',
            border: '2px dashed var(--primary)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1.25rem' 
            }}>
              {hospitals.map(h => (
                <div
                  key={h.id}
                  style={{
                    backgroundColor: 'var(--white)',
                    borderRadius: 18,
                    padding: '1.25rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    border: '1px solid',
                    borderColor: selectedHospital?.id === h.id ? 'var(--primary)' : '#f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 700, 
                        color: '#0f172a', 
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {h.name}
                      </h4>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 6,
                        backgroundColor: h.type === 'Government' ? '#dbeafe' : '#fce7f3',
                        color: h.type === 'Government' ? '#1e40af' : '#9d174d',
                        textTransform: 'uppercase'
                      }}>
                        {h.type || 'Private'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <FiMapPin size={13} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                        <span>{h.location || 'Kathmandu, Nepal'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <FiPhone size={13} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                        <span>{h.phone || '+977 1-4XXXXXX'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedHospital({ id: h.id, name: h.name });
                      setIsHospitalSelectorOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 12,
                      backgroundColor: selectedHospital?.id === h.id ? 'var(--primary)' : 'rgba(82, 178, 191, 0.08)',
                      color: selectedHospital?.id === h.id ? 'var(--white)' : 'var(--primary)',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {selectedHospital?.id === h.id ? (
                      <><FiCheckCircle size={16} /> Selected</>
                    ) : (
                      'Select as My Hospital'
                    )}
                  </button>
                </div>
              ))}
              
              {/* Add New Hospital / View All Card */}
              <div
                onClick={() => navigate('/patient/hospitals')}
                style={{
                  backgroundColor: 'rgba(82, 178, 191, 0.03)',
                  borderRadius: 18,
                  padding: '1.25rem',
                  border: '2px dashed #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  minHeight: 180,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(82, 178, 191, 0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = 'rgba(82, 178, 191, 0.03)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <FiSearch size={20} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>View All Hospitals</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Browse the complete list</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          maxHeight: '600px', 
          overflowY: 'auto', 
          padding: '0.5rem',
          margin: '-0.5rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--primary) transparent'
        }}>
          {doctorsError ? (
            <ErrorDisplay 
              message={doctorsError} 
              onRetry={fetchDoctors} 
              style={{ margin: '1rem 0' }}
            />
          ) : doctorsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading doctors...</div>
          ) : filteredDoctors.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.25rem' 
            }}>
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: 'var(--white)', borderRadius: 20, padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
                    transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                >
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(82,178,191,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                      fontSize: '1.8rem'
                    }}>
                      <FiUser size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>{doc.doctor_name || doc.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.01em' }}>{doc.specialization}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#fffbeb', padding: '0.4rem 0.6rem', borderRadius: 10, border: '1px solid #fef3c7' }}>
                      <FiStar size={14} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>{doc.rating || '4.5'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: 8 }}>
                      <FiBookOpen size={15} style={{ color: 'var(--primary)' }} /> <span>{doc.qualification || 'MBBS'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: 8 }}>
                      <FiBriefcase size={15} style={{ color: 'var(--primary)' }} /> <span>{doc.experience}+ yrs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: 8 }}>
                      <FiPhone size={14} style={{ color: 'var(--primary)' }} /> <span>{doc.phone || 'Contact Support'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedDoctor(doc); setIsBookingModalOpen(true); }}
                    style={{
                      width: '100%', padding: '0.9rem', borderRadius: 14, backgroundColor: 'var(--primary)',
                      color: 'var(--white)', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem',
                      transition: 'filter 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    <FiClock size={16} /> Book Appointment
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 24, border: '2px dashed #e2e8f0', color: 'var(--text-secondary)' }}>
              <FiUsers size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{searchQuery ? 'No doctors match your search.' : 'No doctors available here yet.'}</p>
            </div>
          )}
        </div>
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
