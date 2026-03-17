import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiMail, FiPhone, FiActivity, FiCalendar, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DoctorsManagement = () => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor, specialties, categories, hospitals } = useAdmin();
  const { userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  // Schedule Management State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDoctorForSchedule, setSelectedDoctorForSchedule] = useState(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleViewMonth, setScheduleViewMonth] = useState(new Date());

  
  const [isRequestsTabOpen, setIsRequestsTabOpen] = useState(false);
  const [doctorRequests, setDoctorRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestEdits, setRequestEdits] = useState({}); // Local state for admin to adjust requests

  // Fallbacks for data from context
  const safeDoctors = Array.isArray(doctors) ? doctors : [];
  const safeSpecialties = Array.isArray(specialties) ? specialties : [];
  const safeHospitals = Array.isArray(hospitals) ? hospitals : [];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty_id: '',
    hospital_id: userProfile?.hospital_id || '',
    password: '',
    status: 'Active',
    experience: '',
    bio: '',
    fee: '',
    startTime: '09:00', // Fixed System Standard
    endTime: '17:00',   // Fixed System Standard
    location: 'Kathmandu',
    qualification: '',
    rating: 0,
    availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], timeSlots: ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"] },
    unavailable_dates: []
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const predefinedTimeSlots = [
    "09:00-10:00", "10:00-11:00", "11:00-12:00", 
    "12:00-13:00", "13:00-14:00", "14:00-15:00", 
    "15:00-16:00", "16:00-17:00"
  ];


  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      let st = '09:00';
      let et = '17:00';
      if (doctor.working_hours && doctor.working_hours.includes('-')) {
          const parts = doctor.working_hours.split('-');
          st = parts[0].trim();
          et = parts[1].trim();
      }
      setFormData({
        ...doctor,
        specialty_id: doctor.specialty_id || '',
        hospital_id: doctor.hospital_id || '',
        status: doctor.status || 'Active',
        startTime: '09:00', // Enforce Fixed System Standard
        endTime: '17:00',   // Enforce Fixed System Standard
        location: doctor.location || 'Kathmandu',
        qualification: doctor.qualification || '',
        rating: doctor.rating !== undefined ? doctor.rating : 0,
        availability: doctor.availability ? (typeof doctor.availability === 'string' ? JSON.parse(doctor.availability) : doctor.availability) : { days: [], timeSlots: [] },
        unavailable_dates: doctor.unavailable_dates ? (typeof doctor.unavailable_dates === 'string' ? JSON.parse(doctor.unavailable_dates) : doctor.unavailable_dates) : []
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty_id: '',
        hospital_id: userProfile?.hospital_id || '',
        password: '',
        status: 'Active',
        experience: '',
        bio: '',
        fee: '',
        startTime: '09:00', // Fixed System Standard
        endTime: '17:00',   // Fixed System Standard
        location: 'Kathmandu',
        qualification: '',
        rating: 0,
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], timeSlots: ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"] },
        unavailable_dates: []
      });
    }
    setIsModalOpen(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format working hours from start and end time
      let formattedWorkingHours = '9 AM - 5 PM';
      try {
        const formatTime = (timeStr) => {
           if (!timeStr) return '';
           let [h, m] = timeStr.split(':');
           let hour = parseInt(h, 10);
           const ampm = hour >= 12 ? 'PM' : 'AM';
           hour = hour % 12 || 12;
           return `${hour}:${m} ${ampm}`;
        };
        if (formData.startTime && formData.endTime) {
            formattedWorkingHours = `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;
        }
      } catch(err) {
        console.warn('Could not format time tightly, falling back to string append', err);
        formattedWorkingHours = `${formData.startTime} - ${formData.endTime}`;
      }

      const payload = {
          ...formData,
          working_hours: formattedWorkingHours
      };
      
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, payload);
        setMessage({ text: 'Doctor updated successfully', type: 'success' });
      } else {
        await addDoctor(payload);
        setMessage({ text: 'Doctor added successfully', type: 'success' });
      }
      setIsModalOpen(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.message || 'Operation failed. Please check credentials.', type: 'error' });
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const data = await apiFetch('/doctors/admin/requests');
      setDoctorRequests(data);
      // Initialize edits state with original data
      const edits = {};
      data.forEach(req => {
        if (req.status === 'Pending') {
          edits[req.id] = typeof req.request_data === 'string' ? JSON.parse(req.request_data) : req.request_data;
        }
      });
      setRequestEdits(edits);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleHandleRequest = async (requestId, status, adjustedData = null) => {
    let note = '';
    if (status === 'Rejected') {
      note = prompt(`Enter optional note for rejection:`);
    }
    
    try {
      const { apiFetch } = await import('../../services/apiClient');
      await apiFetch(`/doctors/admin/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, admin_note: note, adjusted_data: adjustedData })
      });
      setMessage({ text: `Request ${status.toLowerCase()}ed successfully`, type: 'success' });
      fetchRequests();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      alert('Failed to update request: ' + err.message);
    }
  };

  // --- Schedule Management Helpers ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day) => {
    const year = scheduleViewMonth.getFullYear();
    const month = scheduleViewMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedScheduleDate(dateStr);
  };

  const currentDaySlots = () => {
    if (!selectedDoctorForSchedule) return [];
    const doc = selectedDoctorForSchedule;
    const avail = typeof doc.availability === 'string' ? JSON.parse(doc.availability) : (doc.availability || {});
    
    // Check exception first
    if (avail.exceptions && avail.exceptions[selectedScheduleDate]) {
      return avail.exceptions[selectedScheduleDate];
    }
    
    // Check if unavailable date
    const unavail = typeof doc.unavailable_dates === 'string' ? JSON.parse(doc.unavailable_dates) : (doc.unavailable_dates || []);
    if (unavail.includes(selectedScheduleDate)) return [];

    // Fallback to recurring
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(selectedScheduleDate));
    if (avail.days && avail.days.includes(dayName)) {
      return avail.timeSlots || [];
    }
    
    return [];
  };

  const toggleSlotForDate = async (slot) => {
    const doc = selectedDoctorForSchedule;
    const avail = typeof doc.availability === 'string' ? JSON.parse(doc.availability) : (doc.availability || { days: [], timeSlots: [], exceptions: {} });
    
    const exceptions = avail.exceptions || {};
    let slotsForDate = currentDaySlots();
    
    if (slotsForDate.includes(slot)) {
      slotsForDate = slotsForDate.filter(s => s !== slot);
    } else {
      slotsForDate = [...slotsForDate, slot].sort();
    }
    
    const newAvail = {
      ...avail,
      exceptions: {
        ...exceptions,
        [selectedScheduleDate]: slotsForDate
      }
    };

    try {
      await updateDoctor(doc.id, { ...doc, availability: newAvail });
      setSelectedDoctorForSchedule({ ...doc, availability: newAvail });
    } catch (err) {
      alert('Failed to update slot: ' + err.message);
    }
  };

  const resetToDefault = async () => {
    const doc = selectedDoctorForSchedule;
    const avail = typeof doc.availability === 'string' ? JSON.parse(doc.availability) : (doc.availability || {});
    
    if (avail.exceptions) {
      delete avail.exceptions[selectedScheduleDate];
      try {
        await updateDoctor(doc.id, { ...doc, availability: avail });
        setSelectedDoctorForSchedule({ ...doc, availability: avail });
        setMessage({ text: `Reset schedule for ${selectedScheduleDate} to default`, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } catch (err) {
        alert('Failed to reset: ' + err.message);
      }
    }
  };

  return (
    <div className="layout-main" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Doctor Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Hospital: {userProfile?.hospital_name || 'Your Hospital'} (ID: {userProfile?.hospital_id})</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => { setIsRequestsTabOpen(!isRequestsTabOpen); if(!isRequestsTabOpen) fetchRequests(); }} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
          >
            <FiActivity /> {isRequestsTabOpen ? 'Manage Doctors' : 'Manage Requests'}
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <FiPlus /> Add Doctor
          </button>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#15803d' : '#b91c1c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
        }}>
          {message.type === 'success' ? <FiCheck /> : <FiX />}
          {message.text}
        </div>
      )}

      {isRequestsTabOpen ? (
        <div className="card" style={{ padding: '2rem', backgroundColor: 'white' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Pending & Recent Requests</h3>
          {loadingRequests ? <p>Loading requests...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {doctorRequests.length > 0 ? doctorRequests.map(req => {
                const isPending = req.status === 'Pending';
                const data = isPending ? (requestEdits[req.id] || {}) : (typeof req.request_data === 'string' ? JSON.parse(req.request_data) : req.request_data);
                
                const updateReqData = (newData) => {
                  setRequestEdits({ ...requestEdits, [req.id]: newData });
                };

                return (
                  <div key={req.id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>Dr. {req.doctor_name}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Requested on {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: req.status === 'Approved' ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                        color: req.status === 'Approved' ? '#15803d' : req.status === 'Rejected' ? '#b91c1c' : '#92400e'
                      }}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiCalendar size={14} /> {req.type === 'Leave' ? 'Leave Request' : 'Schedule Change Request'}
                        {isPending && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 500, marginLeft: 'auto' }}>(You can adjust these before approving)</span>}
                      </div>
                      
                      {req.type === 'Leave' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {(data.leaveDates || []).map((ld, lIdx) => (
                            <div key={ld.date} style={{ fontSize: '0.85rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>{ld.date}</span>
                                {isPending && (
                                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                      <input type="radio" checked={ld.fullDay} onChange={() => {
                                        const newDates = [...data.leaveDates];
                                        newDates[lIdx].fullDay = true;
                                        newDates[lIdx].slots = [];
                                        updateReqData({ ...data, leaveDates: newDates });
                                      }} /> Full Day
                                    </label>
                                    <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                      <input type="radio" checked={!ld.fullDay} onChange={() => {
                                        const newDates = [...data.leaveDates];
                                        newDates[lIdx].fullDay = false;
                                        updateReqData({ ...data, leaveDates: newDates });
                                      }} /> Partial
                                    </label>
                                  </div>
                                )}
                              </div>
                              {!ld.fullDay && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.4rem', marginTop: '0.5rem' }}>
                                  {predefinedTimeSlots.map(s => {
                                    const isActive = ld.slots?.includes(s);
                                    return (
                                      <button 
                                        key={s} 
                                        disabled={!isPending}
                                        onClick={() => {
                                          const newDates = [...data.leaveDates];
                                          const slots = newDates[lIdx].slots || [];
                                          newDates[lIdx].slots = slots.includes(s) ? slots.filter(sl => sl !== s) : [...slots, s].sort();
                                          updateReqData({ ...data, leaveDates: newDates });
                                        }}
                                        style={{ 
                                          padding: '0.3rem', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid',
                                          borderColor: isActive ? '#ef4444' : '#e2e8f0',
                                          backgroundColor: isActive ? 'rgba(239, 68, 68, 0.05)' : '#fff',
                                          color: isActive ? '#ef4444' : '#64748b',
                                          cursor: isPending ? 'pointer' : 'default'
                                        }}
                                      >
                                        {s}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              {ld.fullDay && <div style={{ color: '#ef4444', fontWeight: 500, fontSize: '0.8rem' }}>Doctor will be unavailable for the entire day.</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem' }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Days:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {daysOfWeek.map(day => {
                                const isActive = data.availability?.days?.includes(day);
                                return (
                                  <button
                                    key={day}
                                    disabled={!isPending}
                                    onClick={() => {
                                      const days = data.availability?.days || [];
                                      const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
                                      updateReqData({ ...data, availability: { ...data.availability, days: newDays } });
                                    }}
                                    style={{
                                      padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', border: '1px solid',
                                      borderColor: isActive ? 'var(--primary)' : '#e2e8f0',
                                      backgroundColor: isActive ? 'var(--primary-light)' : '#fff',
                                      color: isActive ? 'var(--primary)' : '#64748b',
                                      cursor: isPending ? 'pointer' : 'default'
                                    }}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Time Slots:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.4rem' }}>
                              {predefinedTimeSlots.map(s => {
                                const isActive = data.availability?.timeSlots?.includes(s);
                                return (
                                  <button 
                                    key={s} 
                                    disabled={!isPending}
                                    onClick={() => {
                                      const slots = data.availability?.timeSlots || [];
                                      const newSlots = slots.includes(s) ? slots.filter(sl => sl !== s) : [...slots, s].sort();
                                      updateReqData({ ...data, availability: { ...data.availability, timeSlots: newSlots } });
                                    }}
                                    style={{ 
                                      padding: '0.3rem', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid',
                                      borderColor: isActive ? 'var(--primary)' : '#e2e8f0',
                                      backgroundColor: isActive ? 'rgba(82,178,191,0.05)' : '#fff',
                                      color: isActive ? 'var(--primary)' : '#64748b',
                                      cursor: isPending ? 'pointer' : 'default'
                                    }}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isPending && (
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                         <button 
                           className="btn btn-outline" 
                           onClick={() => handleHandleRequest(req.id, 'Rejected')}
                           style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                         >
                           Reject
                         </button>
                         <button 
                           className="btn btn-primary" 
                           onClick={() => handleHandleRequest(req.id, 'Approved', data)}
                           style={{ fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}
                         >
                           Approve
                         </button>
                       </div>
                    )}
                    {req.admin_note && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        Admin Note: "{req.admin_note}"
                      </div>
                    )}
                  </div>
                );
              }) : <p style={{ textAlign: 'center', color: '#94a3b8' }}>No requests found.</p>}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {safeDoctors.map(doctor => (
          <div key={doctor.id} className="card shadow-sm" onClick={() => setViewingDoctor(doctor)} style={{ 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: 'none', 
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--primary)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px',
 
                  backgroundColor: 'rgba(82, 178, 191, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <FiActivity size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{doctor.doctor_name || doctor.name}</h3>
                  <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0 0' }}>{doctor.specialty_name || doctor.specialization}</p>
                </div>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                backgroundColor: doctor.status === 'Inactive' ? '#fee2e2' : '#dcfce7',
                color: doctor.status === 'Inactive' ? '#b91c1c' : '#15803d',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {doctor.status || 'Active'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <FiMail size={14} /> {doctor.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <FiPhone size={14} /> {doctor.phone || 'No phone'}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Exp: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{doctor.experience || 0} yrs</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        className="btn btn-outline" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedDoctorForSchedule(doctor);
                            setIsScheduleModalOpen(true);
                        }} 
                        style={{ padding: '0.5rem', minWidth: 'auto', borderRadius: '8px', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                        title="Manage Schedule"
                    >
                        <FiCalendar size={16} />
                    </button>
                    <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); handleOpenModal(doctor); }} style={{ padding: '0.5rem', minWidth: 'auto', borderRadius: '8px' }}>
                        <FiEdit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.5rem', minWidth: 'auto', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); deleteDoctor(doctor.id); }}>
                        <FiTrash2 size={16} />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card shadow-lg" style={{ 
            width: '100%', 
            maxWidth: '850px', 
            maxHeight: '90vh', 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><FiX size={24} /></button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '2rem' }}>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                
                {/* Basic Info Section */}
                <div style={{ gridColumn: 'span 12', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Basic Information</h4>
                </div>
                
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name *</label>
                  <input className="input-field" placeholder="Dr. John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required pattern=".* .*" title="Please provide first and last name separated by a space (e.g. John Doe)" />
                </div>
                
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address *</label>
                  <input className="input-field" type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                
                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number *</label>
                  <input className="input-field" placeholder="98XXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required pattern="[0-9]{10}" title="Phone number must be exactly 10 digits." minLength={10} maxLength={10} />
                </div>

                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Location</label>
                  <select className="input-field" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={{ appearance: 'auto' }}>
                      <option value="Kathmandu">Kathmandu</option>
                      <option value="Lalitpur">Lalitpur</option>
                      <option value="Bhaktapur">Bhaktapur</option>
                      <option value="Pokhara">Pokhara</option>
                      <option value="Biratnagar">Biratnagar</option>
                      <option value="Birgunj">Birgunj</option>
                      <option value="Bharatpur">Bharatpur</option>
                      <option value="Dharan">Dharan</option>
                      <option value="Butwal">Butwal</option>
                      <option value="Janakpur">Janakpur</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ appearance: 'auto' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {!editingDoctor && (
                  <div style={{ gridColumn: 'span 12' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password *</label>
                      <input className="input-field" type="password" placeholder="Enter temporary password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                  </div>
                )}

                {/* Professional Info Section */}
                <div style={{ gridColumn: 'span 12', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Professional Details</h4>
                </div>

                {/* Hospital selection hidden - locked to Sanepa Hospital via value */}
                <input type="hidden" value={formData.hospital_id} />

                <div style={{ gridColumn: 'span 12' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Specialization *</label>
                  <select className="input-field" value={formData.specialty_id} onChange={e => setFormData({ ...formData, specialty_id: e.target.value })} required style={{ appearance: 'auto' }}>
                      <option value="">Select Speciality</option>
                      {safeSpecialties.map(spec => (
                          <option key={spec.id} value={spec.id}>{spec.name}</option>
                      ))}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Qualification</label>
                  <input className="input-field" placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                </div>

                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Experience (Years)</label>
                  <input className="input-field" type="number" min="0" placeholder="e.g. 5" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                </div>

                <div style={{ gridColumn: 'span 4' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rating</label>
                  <input className="input-field" type="number" min="0" max="5" step="0.1" placeholder="e.g. 4.5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
                </div>

                {/* Availability Section */}
                <div style={{ gridColumn: 'span 12', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Working Hours & Availability</h4>
                </div>

                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Start Time (Fixed)</label>
                  <input className="input-field" type="time" value={formData.startTime} readOnly style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
                </div>
                
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>End Time (Fixed)</label>
                  <input className="input-field" type="time" value={formData.endTime} readOnly style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
                </div>

                <div style={{ gridColumn: 'span 12', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Available Days</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const currentDays = formData.availability.days || [];
                          const newDays = currentDays.includes(day) 
                            ? currentDays.filter(d => d !== day) 
                            : [...currentDays, day];
                          setFormData({ ...formData, availability: { ...formData.availability, days: newDays } });
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: formData.availability.days.includes(day) ? 'var(--primary)' : '#cbd5e1',
                          backgroundColor: formData.availability.days.includes(day) ? 'var(--primary-light)' : 'white',
                          color: formData.availability.days.includes(day) ? 'var(--primary)' : '#64748b',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Available Time Slots</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {predefinedTimeSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                              const currentSlots = formData.availability.timeSlots || [];
                              const newSlots = currentSlots.includes(slot)
                              ? currentSlots.filter(s => s !== slot)
                              : [...currentSlots, slot].sort();
                              setFormData({ ...formData, availability: { ...formData.availability, timeSlots: newSlots } });
                          }}
                          style={{
                              padding: '0.4rem 0',
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: formData.availability.timeSlots?.includes(slot) ? 'var(--primary)' : '#e2e8f0',
                              backgroundColor: formData.availability.timeSlots?.includes(slot) ? 'rgba(82, 178, 191, 0.1)' : 'white',
                              color: formData.availability.timeSlots?.includes(slot) ? 'var(--primary)' : '#64748b',
                              cursor: 'pointer',
                              fontWeight: 500,
                              transition: 'all 0.2s'
                          }}
                        >
                          {slot}
                        </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', fontStyle: 'italic' }}>Select all slots when the doctor is available for appointments.</p>
                </div>

                <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 2rem' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }}>{editingDoctor ? 'Update Doctor' : 'Save Doctor'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {viewingDoctor && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card shadow-lg" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Doctor Details</h3>
              <button onClick={() => setViewingDoctor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><FiX size={24} /></button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '15px', backgroundColor: 'rgba(82, 178, 191, 0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  <FiActivity size={30} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{viewingDoctor.doctor_name || viewingDoctor.name}</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--primary)', fontWeight: 500 }}>{viewingDoctor.specialty_name || viewingDoctor.specialization}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMail size={14} color="var(--primary)" /> {viewingDoctor.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiPhone size={14} color="var(--primary)" /> {viewingDoctor.phone || 'Not Provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.location || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Working Hours</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.working_hours || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.experience || 0} Years</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qualification</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.qualification || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.rating ? `${viewingDoctor.rating} / 5` : 'No Rating'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: viewingDoctor.status === 'Inactive' ? '#fee2e2' : '#dcfce7',
                      color: viewingDoctor.status === 'Inactive' ? '#b91c1c' : '#15803d'
                    }}>
                      {viewingDoctor.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsManagement;
