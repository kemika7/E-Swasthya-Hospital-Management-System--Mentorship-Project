import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiStar,
  FiCalendar,
  FiClock,
  FiCheck,
  FiX,
  FiInfo,
  FiAward,
  FiMessageSquare,
  FiChevronDown,
} from 'react-icons/fi';
import { useAdmin } from '../../context/AdminContext';
import { useAppointment } from '../../context/AppointmentContext';

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { updateAppointmentDetails, bookAppointment } = useAppointment();
  const { doctors } = useAdmin();

  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('schedules');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // Feb 2026 as requested

  useEffect(() => {
    const doc = doctors.find((d) => String(d.doctorId) === String(doctorId));
    if (doc) {
      setDoctor(doc);
    } else {
      setDoctor(null);
    }
  }, [doctorId, doctors]);

  if (!doctor) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>
        Doctor not found
      </div>
    );
  }

  // Generate calendar days
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Time slots
  const timeSlots = [
    '07:00 AM', '07:25 AM', '07:45 AM',
    '08:00 AM', '08:25 AM', '08:45 AM',
    '09:00 AM', '09:25 AM', '09:45 AM',
    '10:00 AM', '10:25 AM', '10:45 AM',
    '11:00 AM', '11:25 AM', '11:45 AM',
    '12:45 PM', '01:25 PM', '01:45 PM',
  ];

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
      checkBookingReadiness(day, selectedTime);
    }
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    checkBookingReadiness(selectedDate, time);
  };

  const checkBookingReadiness = (date, time) => {
    if (date && time) {
      setTimeout(() => setShowBookingModal(true), 500);
    }
  };

  const handleConfirmBooking = () => {
    // Update context
    updateAppointmentDetails({
      doctorId: String(doctor.doctorId),
      doctorName: doctor.name,
      specialty: doctor.specialization,
      date: `${String(selectedDate).padStart(2, '0')}.${String(currentMonth.getMonth() + 1).padStart(2, '0')}.${currentMonth.getFullYear()}`,
      time: selectedTime,
      location: doctor.location,
      status: 'Upcoming',
    });
    
    // Book it
    bookAppointment();
    
    // Navigate
    navigate('/appointments');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a', // Dark background as requested
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          backgroundColor: '#f8fafc', // White/light container
          borderRadius: 24,
          overflow: 'hidden',
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* TOP HEADER */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: '#0f172a', // Matches outer bg
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'white',
              margin: 0,
            }}
          >
            Patient – Doctor profile
          </h1>
        </div>

        <div style={{ padding: '1.5rem', flex: 1, backgroundColor: '#f8fafc' }}>
          {/* DOCTOR INFO CARD */}
          <div
            style={{
              backgroundColor: 'rgba(82, 178, 191, 0.15)', // Teal/light-blue tint
              borderRadius: 20,
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Left: Image */}
              <div
                style={{
                  width: 80,
                  height: 100,
                  borderRadius: 16,
                  backgroundColor: '#e2e8f0',
                  backgroundImage: `url(${doctor.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                }}
              />
              
              {/* Right: Details */}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {doctor.name}
                </h2>
                <div style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  {doctor.specialization}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  <FiMapPin size={14} />
                  <span>{doctor.location}</span>
                </div>
                
                {/* Additional Info Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: '#334155' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ opacity: 0.7 }}>Date of Birth</span>
                    <span style={{ fontWeight: 600 }}>{doctor.dateOfBirth}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ opacity: 0.7 }}>Blood Group</span>
                    <span style={{ fontWeight: 600 }}>{doctor.bloodGroup}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ opacity: 0.7 }}>Working Hours</span>
                    <span style={{ fontWeight: 600 }}>{doctor.workingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS ROW */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(82, 178, 191, 0.2)',
              }}
            >
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{doctor.experience}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Experience</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid rgba(82, 178, 191, 0.2)', borderRight: '1px solid rgba(82, 178, 191, 0.2)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{doctor.patientsCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Patients</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  {doctor.reviews} <FiStar size={14} fill="#fbbf24" color="#fbbf24" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reviews</div>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: 12,
              padding: '0.25rem',
              marginBottom: '1.5rem',
            }}
          >
            {[
              { id: 'schedules', label: 'Schedules' },
              { id: 'about', label: 'About' },
              { id: 'experience', label: 'Experience' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? 'var(--white)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'schedules' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {/* Top Selectors */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--white)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCalendar style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                      {selectedDate ? `${selectedDate}.02.2026` : 'Select Date'}
                    </span>
                  </div>
                  <FiChevronDown color="#94a3b8" />
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--white)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiClock style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                      {selectedTime || 'Select Time'}
                    </span>
                  </div>
                  <FiChevronDown color="#94a3b8" />
                </div>
              </div>

              {/* CALENDAR SECTION */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                  February 2026
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                      {day}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem',
                  }}
                >
                  {calendarDays.map((day, index) => {
                    const isSelected = selectedDate === day;
                    // Mock disabled for past days (let's say days < 20 are past for this example)
                    const isDisabled = day && day < 20; 
                    
                    if (!day) return <div key={`empty-${index}`} />;
                    
                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && handleDateClick(day)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: isSelected
                            ? 'var(--primary)'
                            : isDisabled
                            ? 'transparent'
                            : '#f1f5f9',
                          color: isSelected
                            ? 'var(--white)'
                            : isDisabled
                            ? '#cbd5e1'
                            : '#0f172a',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          cursor: isDisabled ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIME SLOT SECTION */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                  Available Time
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                  }}
                >
                  {timeSlots.map((time, index) => {
                    const isSelected = selectedTime === time;
                    // Mock unavailable slots
                    const isUnavailable = index === 2 || index === 5; 

                    return (
                      <button
                        key={time}
                        disabled={isUnavailable}
                        onClick={() => !isUnavailable && handleTimeClick(time)}
                        style={{
                          padding: '0.6rem 0',
                          borderRadius: 8,
                          border: 'none',
                          backgroundColor: isSelected
                            ? 'var(--primary)'
                            : isUnavailable
                            ? '#f1f5f9' // light grey for disabled
                            : '#e2e8f0', // darker grey for available
                          color: isSelected
                            ? 'var(--white)'
                            : isUnavailable
                            ? '#cbd5e1'
                            : '#0f172a',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: isUnavailable ? 'default' : 'pointer',
                        }}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'about' && (
             <div style={{ padding: '1rem', color: '#64748b', lineHeight: 1.6 }}>
               <p><strong>Category:</strong> {doctor.category}</p>
               <p><strong>Subcategory:</strong> {doctor.subcategory}</p>
               <p><strong>Specialization:</strong> {doctor.specialization}</p>
               <p><strong>Location:</strong> {doctor.location}</p>
             </div>
          )}
          
          {activeTab === 'experience' && (
             <div style={{ padding: '1rem', color: '#64748b' }}>
               <p><strong>Total Experience:</strong> {doctor.experience}</p>
               <p style={{ marginTop: '0.5rem' }}>Previous Affiliations: City Hospital, MedLife Clinic.</p>
             </div>
          )}
          
          {activeTab === 'reviews' && (
             <div style={{ padding: '1rem', color: '#64748b' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                 <FiStar fill="#fbbf24" color="#fbbf24" size={24} />
                 <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{doctor.reviews} reviews</span>
               </div>
               <p>Reviews not available in demo.</p>
             </div>
          )}
        </div>
      </div>

      {/* BOOKING ALERT MODAL */}
      {showBookingModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--white)',
              borderRadius: 24,
              padding: '2rem',
              width: '85%',
              maxWidth: 320,
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <FiCheck size={30} color="#059669" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Book Appointment?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {doctor.name}<br />
              {selectedDate} Feb 2026 at {selectedTime}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--white)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default DoctorProfile;
