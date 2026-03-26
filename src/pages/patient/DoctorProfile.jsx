import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { apiFetch } from '../../services/apiClient';
import { useAppointment } from '../../context/AppointmentContext';
import { useHospital } from '../../context/HospitalContext';

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { selectedHospital } = useHospital();
  const location = useLocation();
  const { updateAppointmentDetails, bookAppointment, appointments } = useAppointment();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedules');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState('Consultation');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({ available: true, slots: [], allDaySlots: [] });
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);


  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/doctors/${doctorId}`);
        setDoctor(data);
      } catch (err) {
        console.error('Failed to fetch doctor:', err);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text)', minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <div style={{ color: 'white' }}>Loading doctor profile...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text)', minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <div style={{ color: 'white' }}>Doctor not found</div>
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

  const handleDateClick = async (day) => {
    if (day) {
      setSelectedDate(day);
      setSelectedTime(null);
      setAvailabilityError(null);
      
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setFetchingSlots(true);
      try {
        const data = await apiFetch(`/doctors/${doctorId}/availability?date=${dateStr}`);
        setAvailabilityData(data || { available: false, slots: [], allDaySlots: [] });
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        setAvailabilityError(err.message || 'Failed to load availability');
        setAvailabilityData({ available: false, slots: [], allDaySlots: [] });
      } finally {
        setFetchingSlots(false);
      }
    }
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    if (selectedDate && time) {
       setTimeout(() => setShowBookingModal(true), 500);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedHospital) {
      if (window.confirm('Please select a hospital from the Hospital section first. Would you like to go there now?')) {
        navigate('/patient/hospitals', { state: { from: location } });
      }
      return;
    }
    const convertTo24Hour = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
        if (hours === 24) hours = 12;
      }
      return `${String(hours).padStart(2, '0')}:${minutes}:00`;
    };

    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

    try {
      const bookingData = {
        doctorId: doctor.id,
        doctorName: doctor.doctor_name,
        specialty: doctor.specialty_name || doctor.specialization,
        date: dateStr,
        time: convertTo24Hour(selectedTime),
        location: doctor.location,
        appointmentType: appointmentType,
        status: 'Scheduled',
      };

      updateAppointmentDetails(bookingData);
      await bookAppointment(bookingData);
      setShowBookingModal(false);
      navigate('/patient/appointments');
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to book: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* TOP HEADER */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'var(--primary)',
            borderRadius: '16px 16px 0 0'
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

        <div className="profile-grid" style={{ padding: '1.5rem', flex: 1, backgroundColor: '#f8fafc' }}>
          {/* LEFT COLUMN: DOCTOR INFO + TABS */}
          <div className="profile-left-col">
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
                    {doctor.doctor_name}
                  </h2>
                  <div style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    {doctor.specialty_name || doctor.specialization}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    <FiMapPin size={14} />
                    <span>{doctor.location}</span>
                  </div>

                  {/* Additional Info Row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: '#334155' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ opacity: 0.7 }}>Experience</span>
                      <span style={{ fontWeight: 600 }}>{doctor.experience} Years</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ opacity: 0.7 }}>Hospital</span>
                      <span style={{ fontWeight: 600 }}>{doctor.hospital_name || 'General Hospital'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ opacity: 0.7 }}>Working Hours</span>
                      <span style={{ fontWeight: 600 }}>{doctor.working_hours}</span>
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
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{doctor.fee}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Consultation Fee</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid rgba(82, 178, 191, 0.2)', borderRight: '1px solid rgba(82, 178, 191, 0.2)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{doctor.experience}+</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Years Exp.</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    {doctor.rating || '4.5'} <FiStar size={14} fill="#fbbf24" color="#fbbf24" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rating</div>
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

            {/* NON-BOOKING TAB CONTENT (About, Experience, Reviews) */}
            {activeTab === 'about' && (
              <div style={{ padding: '1rem', color: '#64748b', lineHeight: 1.6 }}>
                <p><strong>Category:</strong> {doctor.category_name}</p>
                <p><strong>Specialty:</strong> {doctor.specialty_name || doctor.specialization}</p>
                <p><strong>Bio:</strong> {doctor.bio || 'No bio available.'}</p>
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
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{doctor.rating || '4.5'} Rating</span>
                </div>
                <p>Reviews coming soon.</p>
              </div>
            )}

            {/* On mobile, if activeTab is schedules, it takes up the entire space (handled by stacking). 
                On desktop, it goes purely to the right column. To maintain UX on mobile, we render the schedule 
                here IF on mobile... OR we can just rely on grid-order. The simplest is to render it in the right column, 
                and if activeTab !== 'schedules', we hide the right column on mobile via CSS 
            */}
          </div>

          {/* RIGHT COLUMN: BOOKING (Only visible when Schedules tab is active) */}
          <div className="profile-right-col" style={{ display: activeTab === 'schedules' ? 'block' : 'none' }}>
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {/* APPOINTMENT TYPE SELECTION */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                  Appointment Type
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['Consultation', 'Follow-up', 'Check-up'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAppointmentType(type)}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.5rem',
                        borderRadius: 12,
                        border: appointmentType === type ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                        backgroundColor: appointmentType === type ? 'rgba(82, 178, 191, 0.1)' : 'white',
                        color: appointmentType === type ? 'var(--primary)' : '#64748b',
                        fontSize: '0.85rem',
                        fontWeight: appointmentType === type ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

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
                  onClick={() => {
                    const el = document.getElementById('available-time-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--white)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiClock style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.9rem', color: selectedTime ? 'var(--primary)' : '#0f172a', fontWeight: selectedTime ? 600 : 400 }}>
                      {selectedTime || 'Select Time'}
                    </span>
                  </div>
                  <FiChevronDown color="#94a3b8" />
                </div>
              </div>

              {/* CALENDAR SECTION */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                  {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
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
                    // Disable past days, days beyond 14 days, and days already booked
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const twoWeeksLater = new Date(today);
                    twoWeeksLater.setDate(today.getDate() + 14);

                    const dateIso = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const unavailableDates = doctor?.unavailable_dates ? (typeof doctor.unavailable_dates === 'string' ? JSON.parse(doctor.unavailable_dates) : doctor.unavailable_dates) : [];
                    const isOnLeave = dateIso && unavailableDates.includes(dateIso);

                    const hasAppointment = day && (appointments || []).some(a => {
                      const aDate = typeof a.date === 'string' ? a.date.split('T')[0] : a.date;
                      return aDate === dateIso && Number(a.doctor_id) === Number(doctorId) && a.status !== 'Cancelled';
                    });

                    const isPast = day && cellDate < today;
                    const isTooFar = day && cellDate > twoWeeksLater;
                    const isDisabled = day && (isPast || isTooFar || hasAppointment || isOnLeave);

                    if (!day) return <div key={`empty-${index}`} />;

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && handleDateClick(day)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '50%',
                          border: isOnLeave ? '1.5px solid #ef4444' : 'none',
                          backgroundColor: isSelected
                            ? 'var(--primary)'
                            : isOnLeave
                              ? '#fff1f2'
                              : isDisabled
                                ? 'transparent'
                                : '#f1f5f9',
                          color: isSelected
                            ? 'var(--white)'
                            : isOnLeave
                              ? '#ef4444'
                              : isDisabled
                                ? '#cbd5e1'
                                : '#0f172a',
                          fontSize: '0.9rem',
                          fontWeight: isOnLeave ? 700 : 500,
                          cursor: isDisabled ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          textDecoration: isOnLeave ? 'line-through' : 'none',
                        }}
                      >
                        {day}
                        {hasAppointment && (
                          <div style={{
                            position: 'absolute', bottom: '4px', width: 4, height: 4, 
                            borderRadius: '50%', backgroundColor: isSelected ? 'white' : 'var(--primary)'
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIME SLOT SECTION */}
              <div id="available-time-section">
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
                  {fetchingSlots ? (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '2rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
                      <div className="spinner" style={{ marginBottom: '0.5rem' }}></div>
                      Checking availability...
                    </div>
                  ) : availabilityError ? (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 12 }}>
                      {availabilityError}. Please try again.
                    </div>
                  ) : selectedDate ? (
                    Array.isArray(availabilityData?.allDaySlots) && availabilityData.allDaySlots.length > 0 ? (
                      availabilityData.allDaySlots.map((slotTime) => {
                        const isSelected = selectedTime === slotTime;
                        const isBooked = !Array.isArray(availabilityData?.slots) || !availabilityData.slots.includes(slotTime);

                        return (
                          <button
                            key={slotTime}
                            disabled={isBooked}
                            onClick={() => !isBooked && handleTimeClick(slotTime)}
                            style={{
                              padding: '0.6rem 0',
                              borderRadius: 8,
                              border: 'none',
                              backgroundColor: isSelected
                                ? 'var(--primary)'
                                : isBooked
                                  ? '#f1f5f9'
                                  : '#e2e8f0',
                              color: isSelected
                                ? 'var(--white)'
                                : isBooked
                                  ? '#cbd5e1'
                                  : '#0f172a',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              cursor: isBooked ? 'default' : 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {slotTime}
                          </button>
                        );
                      })
                    ) : (
                      <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 12 }}>
                        {availabilityData?.message || 'No available time slots for this date.'}
                        {selectedDate && (appointments || []).some(a => {
                          const dateIso = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
                          const aDate = typeof a.date === 'string' ? a.date.split('T')[0] : a.date;
                          return aDate === dateIso && Number(a.doctor_id) === Number(doctorId) && a.status !== 'Cancelled';
                        }) && (
                          <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                            You already have an appointment on this day with this doctor.
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                      Please select a date from the calendar to see available slots
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
              {doctor.doctor_name}<br />
              {selectedDate} {currentMonth.toLocaleString('default', { month: 'short' })} {currentMonth.getFullYear()} at {selectedTime}
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
          
          .profile-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          /* Desktop layout mapping */
          @media (min-width: 768px) {
            .profile-grid:has(.profile-right-col[style*="display: block"]) {
              grid-template-columns: 1fr 1.2fr;
            }
          }
        `}
      </style>
    </>
  );
};

export default DoctorProfile;
