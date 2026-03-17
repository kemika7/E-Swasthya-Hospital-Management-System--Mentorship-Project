import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    DoughnutController,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import { FiActivity, FiBarChart2, FiEdit2, FiPlus, FiTrash2, FiX, FiAlertTriangle, FiUser, FiMapPin, FiClock } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import ErrorDisplay from '../../components/ErrorDisplay';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointment } from '../../context/AppointmentContext';

Chart.register(
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement
);

// Doctor illustration: set VITE_DOCTOR_IMAGE in .env to override; otherwise fallback is used
import defaultDoctorImage from '../../assets/images/doctor-dashboard.png';

const getDoctorImageSrc = () => {
  const envPath = import.meta.env.VITE_DOCTOR_IMAGE;
  if (envPath) return envPath;
  return defaultDoctorImage;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// No mock data constants here

const getWeekDays = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    days.push(x);
  }
  return days;
};

// No mock activity generators

const DoctorDashboard = () => {
  const { userProfile } = useAuth();
  const { appointments, refreshAppointments } = useAppointment();

  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: { offline: 0, online: 0, laboratory: 0 },
    scheduledEvents: { labels: [], values: [] },
    todayCount: 0,
    activities: [],
    upcomingAppointments: []

  });
  const [fullProfile, setFullProfile] = useState(null);
  const [calendarActivities, setCalendarActivities] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Derived appointment dates for calendar highlights
  const appointmentDates = React.useMemo(() => {
    return (appointments || [])
      .filter(a => a.status === 'Scheduled')
      .map(a => {
        try {
          return new Date(a.date).toISOString().split('T')[0];
        } catch (e) {
          return a.date;
        }
      });
  }, [appointments]);
  
  // Custom To-Do List State
  const [todos, setTodos] = useState([]);
  const [newTodoInput, setNewTodoInput] = useState('');
  const [newTodoDesc, setNewTodoDesc] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // Requests State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('Leave'); // 'Leave' or 'Schedule'
  const [requestForm, setRequestForm] = useState({
    leaveDates: [], // Array of { date: 'YYYY-MM-DD', fullDay: true, slots: [] }
    availability: { days: [], timeSlots: [] }
  });
  const [myRequests, setMyRequests] = useState([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const PREDEFINED_SLOTS = [
    "09:00-10:00", "10:00-11:00", "11:00-12:00", 
    "12:00-13:00", "13:00-14:00", "14:00-15:00", 
    "15:00-16:00", "16:00-17:00"
  ];


  const [profileForm, setProfileForm] = useState({
    name: '',
    specialization: '',
    location: '',
    dob: '',
    blood_group: '',
    working_hours: ''
  });

  const doctorFullName = userProfile?.name || 'Doctor';
  const today = new Date();
  const currentDateStr = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const currentDayName = DAY_NAMES[today.getDay()];

  const [eventsFilter, setEventsFilter] = useState('Today');
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDays = getWeekDays(today);
  const selectedDateKey = selectedDate.toDateString();

  const fetchDashboard = async () => {
    setDashboardError(null);
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const data = await apiFetch('/dashboard/doctor');
      if (!data) return;
      setDashboardData(prev => ({
        ...prev,
        ...data,
        stats: { ...(prev.stats || {}), ...(data.stats || {}) }
      }));
    } catch (err) {
      console.error('Failed to fetch doctor dashboard:', err);
      setDashboardError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setProfileError(null);
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const data = await apiFetch('/doctors/profile');
      setFullProfile(data);
      setProfileForm({
        name: data.name || '',
        specialization: data.specialization || '',
        location: data.location || '',
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        blood_group: data.blood_group || '',
        working_hours: data.working_hours || ''
      });
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
      setProfileError(err.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const data = await apiFetch('/doctors/requests');
      setMyRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {

    fetchDashboard();
    fetchProfile();
    fetchRequests();
    if (typeof refreshAppointments === 'function') {
      refreshAppointments();
    }
  }, []);

  // Sync Todos (Plans + Today's Appointments)
  useEffect(() => {
    const mixedTodos = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Add Today's Appointments
    if (Array.isArray(appointments)) {
      appointments.filter(a => {
        try {
          return a.status !== 'Cancelled' && new Date(a.date).toISOString().split('T')[0] === todayStr;
        } catch (e) { return false; }
      }).forEach(a => {
        mixedTodos.push({
          id: `apt-${a.id}`,
          type: 'appointment',
          title: `Consultation: ${a.patient_name || a.patientName || 'Patient'}`,
          status: a.status || 'Scheduled',
          time: a.start_time || a.time
        });
      });
    }

    // 2. Add Custom Plans
    if (Array.isArray(dashboardData.doctorPlans)) {
      dashboardData.doctorPlans.forEach(p => {
        mixedTodos.push({
          id: p.id,
          type: 'plan',
          title: p.title,
          description: p.description,
          status: p.status
        });
      });
    }

    setTodos(mixedTodos);
  }, [appointments, dashboardData.doctorPlans]);


  // Fetch Appointments for Selected Date
  useEffect(() => {
    // We already have all appointments in our context!
    // Simply filter them for the selected date.
    const yy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yy}-${mm}-${dd}`;
    
    const dayAppointments = appointments.filter(a => {
        try {
            const aDate = new Date(a.date).toISOString().split('T')[0];
            return aDate === dateStr && a.status === 'Scheduled';
        } catch (e) { return false; }
    }).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    setCalendarActivities(dayAppointments.map(a => {
        let title = 'Consultation';
        try {
          title = `Consultation: ${a.patient_name || a.patientName || 'Patient'}`;
        } catch (e) {}
        
        return {
            id: a.id,
            time: a.time,
            duration: a.duration,
            title,
            patientName: a.patient_name || a.patientName || 'Patient',
            status: a.status,
            notes: a.notes
        };
    }));
  }, [selectedDate, appointments]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { apiFetch } = await import('../../services/apiClient');
      await apiFetch('/doctors/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm)
      });
      
      setFullProfile(prev => ({
        ...prev,
        ...profileForm,
      }));
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile: ' + err.message);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;

    try {
      const { apiFetch } = await import('../../services/apiClient');
      const todayISO = today.toISOString().split('T')[0];
      const res = await apiFetch('/plans', {
        method: 'POST',
        body: JSON.stringify({ title: newTodoInput.trim(), description: newTodoDesc.trim(), date: todayISO })
      });

      setTodos([...todos, {
        id: res.id,
        type: 'plan',
        title: res.title,
        description: newTodoDesc.trim(),
        status: res.status
      }]);
      setNewTodoInput('');
      setNewTodoDesc('');
      setIsAddingTodo(false);
    } catch (err) {
      console.error('Failed to add plan:', err);
      alert('Failed to add plan: ' + err.message);
    }
  };

  const handleToggleTodo = async (todoId, type, currentStatus) => {
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      
      if (type === 'plan') {
         await apiFetch(`/plans/${todoId}`, {
           method: 'PUT',
           body: JSON.stringify({ status: newStatus })
         });
      } else if (type === 'appointment') {
         // Optionally, uncomment if you want clicking an appointment to actually hit DB
         // await apiFetch(`/appointments/${todoId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });

      }


      setTodos(todos.map(t => Math.floor(t.id) === Math.floor(todoId) ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };


  const handleDeleteTodo = async (todoId) => {
    try {
      const { apiFetch } = await import('../../services/apiClient');
      await apiFetch(`/plans/${todoId}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== todoId));
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
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

  const getTimeRange = (timeStr, duration = 30) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours, 10);
      let m = parseInt(minutes, 10);
      
      const startDate = new Date();
      startDate.setHours(h, m, 0);
      
      const endDate = new Date(startDate.getTime() + (duration * 60000));
      
      const startTimeRefined = formatTime(timeStr);
      const endHours = endDate.getHours();
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
      const endTimeStr = `${String(endHours).padStart(2, '0')}:${endMinutes}`;
      const endTimeRefined = formatTime(endTimeStr);
      
      return `${startTimeRefined} - ${endTimeRefined}`;
    } catch (e) {
      return formatTime(timeStr);
    }
  };


  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      const { apiFetch } = await import('../../services/apiClient');
      
      await apiFetch('/doctors/requests', {
        method: 'POST',
        body: JSON.stringify({ type: requestType, request_data: requestForm })
      });

      alert('Request submitted to admin for approval.');
      setIsRequestModalOpen(false);
      // Refresh requests
      const response = await apiFetch('/doctors/requests');
      setMyRequests(response);
    } catch (err) {
      console.error('Failed to submit request:', err);
      alert('Failed: ' + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const doctorImageSrc = getDoctorImageSrc();

  // Filter context appointments for today and upcoming
  const upcomingContext = appointments.filter(a => {
      try {
          const aDate = new Date(a.date);
          const todayCopy = new Date(today);
          todayCopy.setHours(0, 0, 0, 0);
          return aDate >= todayCopy && a.status === 'Scheduled';
      } catch (e) { return false; }
  }).sort((a, b) => {
      try {
          const d1 = new Date(a.date).toISOString().split('T')[0];
          const d2 = new Date(b.date).toISOString().split('T')[0];
          if (d1 !== d2) return d1.localeCompare(d2);
          return (a.time || '').localeCompare(b.time || '');
      } catch (e) { return 0; }
  });

  const appointmentsByDate = (appointments || []).reduce((acc, a) => {
    if (a.status === 'Cancelled' || !a.date) return acc;
    try {
      const dateStr = new Date(a.date).toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
    } catch (e) {
      console.error('Invalid date in appointmentsByDate:', a.date);
    }
    return acc;
  }, {});

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
      }}
    >
      {dashboardError && (
        <ErrorDisplay 
          message={dashboardError} 
          onRetry={fetchDashboard} 
          style={{ marginBottom: '1rem' }}
        />
      )}
      {profileError && (
        <ErrorDisplay 
          message={`Profile Error: ${profileError}`} 
          onRetry={fetchProfile} 
          style={{ marginBottom: '1rem' }}
        />
      )}
      {/* GREETING CARD */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: 16,
          padding: 'var(--space-md) var(--space-lg)',
          marginBottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.25rem' }}>
            {currentDateStr}
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)', margin: '0 0 0.25rem' }}>
            Welcome to {userProfile?.hospital_name || 'Hospital'} Doctor Dashboard!
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.95)', margin: 0 }}>
            Good Day Dr. {doctorFullName}, have a Nice {currentDayName}!
          </p>
        </div>
        <div
          style={{
            flexShrink: 0,
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={doctorImageSrc}
            alt="Doctor"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-md)',
          marginBottom: 0,
        }}
      >
        {[
          { title: 'Offline Work', count: dashboardData.stats?.offline || 0, subtitle: 'Total Appointments', Icon: MdLocalHospital },
          { title: 'Online Work', count: dashboardData.stats?.online || 0, subtitle: 'Pending Consultations', Icon: FiActivity },

        ].map(({ title, count, subtitle, Icon }) => (
          <div
            key={title}
            style={{
              backgroundColor: 'var(--primary)',
              borderRadius: 16,
              padding: '1.25rem',
              color: 'var(--white)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{title}</span>
              <Icon size={20} style={{ opacity: 0.9 }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{count}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{subtitle}</div>
          </div>
        ))}
      </div>

      {/* GRID: Scheduled Events | Plans Done | Profile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 'var(--space-lg)',
          marginBottom: 0,
        }}
      >
        {/* MY SCHEDULED EVENTS */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              My Scheduled Events
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, maxHeight: '250px', paddingRight: '4px' }}>
            {Array.isArray(upcomingContext) && upcomingContext.length > 0 ? upcomingContext.slice(0, 5).map((a) => (
              <div key={a.id} style={{
                padding: '0.75rem', borderRadius: 10, backgroundColor: 'rgba(82,178,191,0.05)', border: '1px solid rgba(82,178,191,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.patient_name || a.patientName || 'Patient'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>{getTimeRange(a.time, a.duration)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</span>
                  <span style={{ 
                    fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 4, 
                    backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 
                  }}>{a.status || 'Scheduled'}</span>
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto 0' }}>No scheduled events</div>
            )}
          </div>
        </div>

        {/* MY PLANS DONE / TO-DO LIST */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              My Plans Done
            </h2>
          </div>
          
          {!isAddingTodo ? (
            <button 
              onClick={() => setIsAddingTodo(true)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 12, border: '1px dashed var(--primary)', 
                color: 'var(--primary)', backgroundColor: 'transparent', fontWeight: 600, cursor: 'pointer',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <FiPlus size={18} /> Add New Plan
            </button>
          ) : (
            <form onSubmit={handleAddTodo} style={{ 
              display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', 
              padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc'
            }}>
              <input 
                type="text" 
                placeholder="Task title..." 
                value={newTodoInput}
                onChange={(e) => setNewTodoInput(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem'
                }}
                required
              />
              <textarea 
                placeholder="Description (optional)..." 
                value={newTodoDesc}
                onChange={(e) => setNewTodoDesc(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem',
                  minHeight: '60px', resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="submit" 
                  style={{
                    flex: 1, backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  Save Task
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsAddingTodo(false); setNewTodoInput(''); setNewTodoDesc(''); }}
                  style={{
                    backgroundColor: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, maxHeight: '200px', paddingRight: '4px' }}>
            {Array.isArray(todos) && todos.length > 0 ? todos.map((todo) => {

              const isDone = todo.status === 'Completed';
              return (
                <div key={todo.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: 8, 
                  backgroundColor: 'rgba(148,163,184,0.05)', border: '1px solid rgba(82,178,191,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <input 
                      type="checkbox" 
                      checked={isDone} 
                      onChange={() => handleToggleTodo(todo.id, todo.type, todo.status)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ 
                        fontSize: '0.85rem', color: isDone ? 'var(--text-secondary)' : 'var(--text)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
                      }}>
                        {todo.title || 'Untitled Task'}
                      </span>
                      {todo.description && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{todo.description}</span>
                      )}

                      {todo.type === 'appointment' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>Appointment {todo.time ? `• ${formatTime(todo.time)}` : ''}</span>
                      )}
                    </div>
                  </div>
                  {todo.type === 'plan' && (
                    <button 
                      onClick={() => handleDeleteTodo(todo.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, transition: 'opacity 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.opacity = 1}
                      onMouseOut={e => e.currentTarget.style.opacity = 0.7}
                    >
                      <FiTrash2 size={16} />
                    </button>

                  )}
                </div>
              );
            }) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto 0' }}>No tasks for today!</div>
            )}
          </div>
        </div>

        {/* MY PROFILE */}
        {/* MY PROFILE */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser style={{ color: 'var(--primary)' }} /> My Profile
            </h2>
            <button 
              type="button" 
              onClick={() => setIsEditingProfile(true)}
              style={{ border: 'none', background: 'rgba(82, 178, 191, 0.1)', color: 'var(--primary)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              title="Edit Profile"
            >
              <FiEdit2 size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
             <div style={{
               width: 70, height: 70, borderRadius: '50%', backgroundColor: 'rgba(82, 178, 191, 0.2)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem'
             }}>
               {(fullProfile?.name || doctorFullName || 'D').charAt(0)}
             </div>
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>
                  Dr. {fullProfile?.name || doctorFullName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                  {fullProfile?.specialization || 'General Health'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <FiMapPin size={12} /> {fullProfile?.location || 'Kathmandu, Nepal'}
                </div>
             </div>
          </div>

          <div style={{ 
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', 
            backgroundColor: '#f8fafc', borderRadius: 12, marginBottom: '1.5rem' 
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>D.O.B</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                {fullProfile?.dob ? new Date(fullProfile.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 15, 1985'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Blood Group</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                {fullProfile?.blood_group || 'O+'}
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Working Hours</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiClock size={12} /> {fullProfile?.working_hours || '09:00 AM - 05:00 PM'}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsRequestModalOpen(true)}
            style={{ 
              width: '100%', padding: '0.8rem', borderRadius: 12, 
              backgroundColor: 'var(--primary)', color: 'white', border: 'none',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(82, 178, 191, 0.2)'
            }}
          >
            <FiPlus size={18} /> Request Leave / Change
          </button>

          <div style={{ marginTop: '1.5rem', flex: 1 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>Recent Requests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {Array.isArray(myRequests) && myRequests.length > 0 ? myRequests.map(r => {
                const data = typeof r.request_data === 'string' ? JSON.parse(r.request_data) : r.request_data;
                const formattedDates = r.type === 'Leave' 
                  ? `${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}`
                  : `${new Date(data.targetDate).toLocaleDateString()}`;
                
                return (
                  <div key={r.id} style={{ 
                    padding: '0.85rem', backgroundColor: '#f8fafc', 
                    borderRadius: 12, border: '1px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.85rem' }}>{r.type === 'Leave' ? '🌴 Leave' : '📅 Schedule'}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                          {formattedDates}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: 6, fontWeight: 700,
                        backgroundColor: r.status === 'Approved' ? '#dcfce7' : r.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                        color: r.status === 'Approved' ? '#15803d' : r.status === 'Rejected' ? '#b91c1c' : '#b45309'
                      }}>
                        {r.status}
                      </div>
                    </div>
                    {data.reason && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem' }}>
                        "{data.reason}"
                      </div>
                    )}
                    {r.admin_note && (
                      <div style={{ fontSize: '0.7rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '0.4rem', borderRadius: 6, marginTop: '2px' }}>
                        <strong>Note:</strong> {r.admin_note}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No requests submitted yet.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MY CALENDAR */}
      <div
        style={{
          backgroundColor: 'var(--white)',
          borderRadius: 16,
          padding: '1.25rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            My Calendar
          </h2>
          <Link to="/doctor/calendar" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            View All Calendar
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {weekDays.map((d) => {
            const isSelected = d.toDateString() === selectedDateKey;
            const isToday = d.toDateString() === today.toDateString();
            const dateStr = d.toISOString().split('T')[0];
            const hasAppointment = appointmentDates.includes(dateStr);
            
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: 12,
                  border: isToday ? '2px solid var(--primary)' : '1px solid rgba(23,23,16,0.1)',
                  backgroundColor: isSelected ? 'var(--primary)' : isToday ? 'rgba(82,178,191,0.1)' : 'var(--white)',
                  color: isSelected ? 'var(--white)' : 'var(--text)',
                  fontSize: '0.85rem',
                  fontWeight: isToday ? 600 : 400,
                  cursor: 'pointer',
                  minWidth: 44,
                  position: 'relative',
                  boxShadow: hasAppointment && !isSelected ? '0 0 8px rgba(82,178,191,0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{DAY_NAMES[d.getDay()].slice(0, 3)}</div>
                <div>{d.getDate()}</div>
                {hasAppointment && !isSelected && (
                  <div style={{
                    position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)',
                    width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--primary)'
                  }} />
                )}
                {appointmentsByDate[dateStr] > 0 && !isSelected && (
                  <div style={{
                    position: 'absolute', top: '4px', right: '4px',
                    backgroundColor: 'var(--primary)', color: 'white',
                    fontSize: '0.6rem', fontWeight: 700,
                    width: '14px', height: '14px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid white'
                  }}>
                    {appointmentsByDate[dateStr]}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              Daily Activities – {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            {loadingCalendar && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Loading...</span>}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {Array.isArray(calendarActivities) && calendarActivities.length > 0 ? (
              calendarActivities.map((a, i) => (
                <li
                  key={i}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 8,
                    backgroundColor: 'rgba(148,163,184,0.08)',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary)', minWidth: 70, fontSize: '0.85rem' }}>{getTimeRange(a.time, a.duration)}</span>
                      <span style={{ 
                        fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 4, 
                        backgroundColor: a.status === 'Scheduled' ? '#dcfce7' : '#f1f5f9', 
                        color: a.status === 'Scheduled' ? '#15803d' : '#64748b', fontWeight: 600 
                      }}>{a.status || 'Scheduled'}</span>
                    </div>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{a.patient_name || a.patientName || 'Patient'}</span>
                  </div>

                </li>
              ))
            ) : (
              <li style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No activities for this day.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* UPCOMING APPOINTMENTS */}
      <div
        style={{
          backgroundColor: 'var(--white)',
          borderRadius: 16,
          padding: '1.25rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 1rem' }}>
          Upcoming Appointments
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {Array.isArray(upcomingContext) && upcomingContext.length > 0 ? (
              upcomingContext.map((a, i) => (

                <li
                  key={a.id || i}
                  style={{
                    padding: '1rem',
                    borderRadius: 12,
                    backgroundColor: 'rgba(82,178,191,0.05)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(82,178,191,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      { (a.patient_name || a.patientName || 'P').charAt(0) }
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{a.patient_name || a.patientName || 'Patient'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.type || 'Consultation'}</div>
                      {a.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                          " {a.notes} "
                        </div>
                      )}

                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
                      {a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{getTimeRange(a.time, a.duration)}</div>
                    <div style={{ 
                      fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 4, marginTop: '4px',
                      backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600, textAlign: 'center'
                    }}>{a.status || 'Scheduled'}</div>

                  </div>
                </li>
              ))
            ) : (
              <li style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No upcoming appointments.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* REQUEST MODAL */}
      {isRequestModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', 
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 110, padding: '1rem'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto',
            padding: '2rem', backgroundColor: 'var(--white)', borderRadius: 24,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Request Form</h2>
              <button 
                onClick={() => setIsRequestModalOpen(false)} 
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}
              >
                <FiX size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ 
              display: 'flex', backgroundColor: '#f1f5f9', borderRadius: 12, 
              padding: '0.25rem', marginBottom: '1.5rem' 
            }}>
              {['Leave', 'Schedule'].map((t) => (
                <button
                  key={t}
                  onClick={() => setRequestType(t)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                    backgroundColor: requestType === t ? 'white' : 'transparent',
                    color: requestType === t ? 'var(--primary)' : '#64748b',
                    fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: requestType === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {t === 'Leave' ? 'Request Leave' : 'Schedule Change'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {requestType === 'Leave' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Start Date</label>
                      <input 
                        type="date" 
                        required 
                        className="input-field"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                        onChange={(e) => setRequestForm({...requestForm, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>End Date</label>
                      <input 
                        type="date" 
                        required 
                        className="input-field"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                        onChange={(e) => setRequestForm({...requestForm, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Reason for Leave</label>
                    <textarea 
                      required 
                      placeholder="Please specify the reason..."
                      style={{ 
                        width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0',
                        minHeight: '100px', resize: 'vertical'
                      }}
                      onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Effective Date</label>
                    <input 
                      type="date" 
                      required 
                      className="input-field"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                      onChange={(e) => setRequestForm({...requestForm, targetDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>New Available Slots</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                      {PREDEFINED_SLOTS.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            const current = requestForm.availability?.timeSlots || [];
                            const updated = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot];
                            setRequestForm({
                              ...requestForm, 
                              availability: { 
                                ...requestForm.availability, 
                                days: DAY_NAMES, 
                                timeSlots: updated 
                              }
                            });
                          }}
                          style={{
                            padding: '0.5rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                            border: requestForm.availability?.timeSlots?.includes(slot) ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                            backgroundColor: requestForm.availability?.timeSlots?.includes(slot) ? 'rgba(82, 178, 191, 0.1)' : 'white',
                            color: requestForm.availability?.timeSlots?.includes(slot) ? 'var(--primary)' : '#64748b',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {formatTime(slot.split('-')[0])} - {formatTime(slot.split('-')[1])}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Reason for Change</label>
                    <textarea 
                      required 
                      placeholder="Why do you need to change your schedule?"
                      style={{ 
                        width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0',
                        minHeight: '80px', resize: 'vertical'
                      }}
                      onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setIsRequestModalOpen(false)}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingRequest}
                  style={{ 
                    flex: 1, padding: '0.8rem', borderRadius: 12, border: 'none',
                    backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700, 
                    cursor: submittingRequest ? 'not-allowed' : 'pointer',
                    opacity: submittingRequest ? 0.7 : 1
                  }}
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', 
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 110, padding: '1rem'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '500px', padding: '2rem', 
            backgroundColor: 'var(--white)', borderRadius: 24,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Edit Profile</h3>
              <button 
                onClick={() => setIsEditingProfile(false)} 
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}
              >
                <FiX size={20} color="#64748b" />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Full Name</label>
                <input 
                  className="input-field" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Specialization</label>
                  <input 
                    className="input-field" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                    value={profileForm.specialization} 
                    onChange={e => setProfileForm({...profileForm, specialization: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Location</label>
                  <input 
                    className="input-field" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                    value={profileForm.location} 
                    onChange={e => setProfileForm({...profileForm, location: e.target.value})} 
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Date of Birth</label>
                  <input 
                    type="date"
                    className="input-field" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                    value={profileForm.dob} 
                    onChange={e => setProfileForm({...profileForm, dob: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Blood Group</label>
                  <input 
                    className="input-field" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                    value={profileForm.blood_group} 
                    onChange={e => setProfileForm({...profileForm, blood_group: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Working Hours</label>
                <input 
                  className="input-field" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
                  value={profileForm.working_hours} 
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                  onChange={e => setProfileForm({...profileForm, working_hours: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setIsEditingProfile(false)}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ 
                    flex: 1, padding: '0.8rem', borderRadius: 12, border: 'none',
                    backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
