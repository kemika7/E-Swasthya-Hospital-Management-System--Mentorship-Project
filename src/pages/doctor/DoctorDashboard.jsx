<<<<<<< HEAD
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
import { FiActivity, FiBarChart2, FiEdit2, FiX } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
=======
import React, { useEffect, useState } from 'react';
import { FiActivity, FiEdit2, FiPlus, FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import ErrorDisplay from '../../components/ErrorDisplay';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointment } from '../../context/AppointmentContext';
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a

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
<<<<<<< HEAD
    activities: [],
    upcomingAppointments: []
=======
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
  });
  const [fullProfile, setFullProfile] = useState(null);
  const [calendarActivities, setCalendarActivities] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
<<<<<<< HEAD
  // Custom To-Do List State
  const [todos, setTodos] = useState([]);
  const [newTodoInput, setNewTodoInput] = useState('');
=======
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

>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a

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
<<<<<<< HEAD
    const fetchDashboard = async () => {
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const data = await apiFetch('/dashboard/doctor');
        setDashboardData(data);
        setCalendarActivities(data.activities || []);
        
        // Merge custom plans and today's appointments for To-Do List
        const mixedTodos = [];
        if (data.activities && data.activities.length) {
          data.activities.forEach(a => {
            // Note: Appointment completion isn't fully robust here unless we fetch their exact statuses, 
            // but for dashboard display context, we'll mark them pending by default unless their data says otherwise.
            mixedTodos.push({
               id: a.appointment_id || Date.now() + Math.random(), 
               type: 'appointment',
               title: a.title,
               status: a.status || 'Pending',
               time: a.time
            });
          });
        }
        if (data.doctorPlans && data.doctorPlans.length) {
           data.doctorPlans.forEach(p => {
             mixedTodos.push({
                id: p.id,
                type: 'plan',
                title: p.title,
                status: p.status
             });
           });
        }
        setTodos(mixedTodos);

      } catch (err) {
        console.error('Failed to fetch doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
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
      }
    };

=======
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
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

<<<<<<< HEAD
    const fetchDayAppointments = async () => {
      setLoadingCalendar(true);
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const yy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${yy}-${mm}-${dd}`;
        const data = await apiFetch(`/appointments?date=${dateStr}`);
        setCalendarActivities(data.map(a => ({
          time: a.time,
          title: `Consultation: ${a.patientName}`
        })));
      } catch (err) {
        console.error('Failed to fetch calendar appointments:', err);
      } finally {
        setLoadingCalendar(false);
=======
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
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
      }

<<<<<<< HEAD
    fetchDayAppointments();
  }, [selectedDate, today, dashboardData.activities]);

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
        body: JSON.stringify({ title: newTodoInput.trim(), date: todayISO })
      });

      setTodos([...todos, {
        id: res.id,
        type: 'plan',
        title: res.title,
        status: res.status
      }]);
      setNewTodoInput('');
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

=======
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
      setTodos(todos.map(t => Math.floor(t.id) === Math.floor(todoId) ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };
<<<<<<< HEAD

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
=======
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a

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

<<<<<<< HEAD
    pieInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: dashboardData.scheduledEvents.labels,
        datasets: [
          {
            data: dashboardData.scheduledEvents.values,
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
=======
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
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a

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
<<<<<<< HEAD
          { title: 'Offline Work', count: dashboardData.stats.offline, subtitle: 'Total Appointments', Icon: MdLocalHospital },
          { title: 'Online Work', count: dashboardData.stats.online, subtitle: 'Pending Consultations', Icon: FiActivity },
=======
          { title: 'Offline Work', count: dashboardData.stats?.offline || 0, subtitle: 'Total Appointments', Icon: MdLocalHospital },
          { title: 'Online Work', count: dashboardData.stats?.online || 0, subtitle: 'Pending Consultations', Icon: FiActivity },
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
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
          
<<<<<<< HEAD
          <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Add new task..." 
              value={newTodoInput}
              onChange={(e) => setNewTodoInput(e.target.value)}
              style={{
                flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid rgba(23,23,16,0.1)', fontSize: '0.85rem'
              }}
            />
            <button 
              type="submit" 
              style={{
                backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '0 0.75rem', cursor: 'pointer', fontWeight: 600
              }}
            >
              +
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, maxHeight: '200px', paddingRight: '4px' }}>
            {todos.length > 0 ? todos.map((todo) => {
=======
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
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
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
<<<<<<< HEAD
                        {todo.title}
                      </span>
=======
                        {todo.title || 'Untitled Task'}
                      </span>
                      {todo.description && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{todo.description}</span>
                      )}
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
                      {todo.type === 'appointment' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>Appointment {todo.time ? `• ${formatTime(todo.time)}` : ''}</span>
                      )}
                    </div>
                  </div>
                  {todo.type === 'plan' && (
                    <button 
                      onClick={() => handleDeleteTodo(todo.id)}
<<<<<<< HEAD
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                    >×</button>
=======
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, transition: 'opacity 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.opacity = 1}
                      onMouseOut={e => e.currentTarget.style.opacity = 0.7}
                    >
                      <FiTrash2 size={16} />
                    </button>
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
                  )}
                </div>
              );
            }) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto 0' }}>No tasks for today!</div>
            )}
          </div>
        </div>

        {/* MY PROFILE */}
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
              My Profile
            </h2>
            <button 
              type="button" 
              onClick={() => setIsEditingProfile(true)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
            >
              <FiEdit2 size={18} style={{ color: 'var(--primary)' }} />
            </button>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
<<<<<<< HEAD
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Dr. {fullProfile?.name || doctorFullName}</div>
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '0.5rem' }}>{fullProfile?.specialization || 'Cardiologist'}</div>
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '1rem' }}>{fullProfile?.location || 'Kathmandu, Nepal'}</div>
=======
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Dr. {fullProfile?.name || doctorFullName || 'Doctor'}</div>
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '0.5rem' }}>{fullProfile?.specialization || 'Healthcare Provider'}</div>
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '1rem' }}>{fullProfile?.location || 'Location Not Set'}</div>
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
            <div style={{ display: 'grid', gap: '0.35rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(23,23,16,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>Date of Birth</span>
                <span>{fullProfile?.dob ? new Date(fullProfile.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 15, 1985'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>Blood Group</span>
                <span>{fullProfile?.blood_group || 'O+'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>Working Hours</span>
                <span>{fullProfile?.working_hours || '9 AM - 5 PM'}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              style={{ 
                marginTop: '1.25rem', width: '100%', padding: '0.6rem', borderRadius: 8, 
                backgroundColor: 'rgba(82,178,191,0.1)', color: 'var(--primary)', border: '1px solid var(--primary)',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Request Leave / Schedule Change
            </button>
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Recent Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {Array.isArray(myRequests) && myRequests.length > 0 ? myRequests.slice(0, 3).map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.4rem', backgroundColor: '#f8fafc', borderRadius: 6 }}>
                    <span style={{ fontWeight: 500 }}>{r.type || 'Request'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ 
                        color: r.status === 'Approved' ? '#10b981' : r.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                        fontWeight: 600
                      }}>{r.status || 'Pending'}</span>
                      {r.admin_note && <span style={{ fontSize: '0.65rem', color: '#64748b', maxWidth: '150px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>Note: {r.admin_note}</span>}
                    </div>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>No requests yet</div>
                )}
              </div>
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
<<<<<<< HEAD
                  <span style={{ fontWeight: 600, color: 'var(--primary)', minWidth: 70 }}>{formatTime(a.time)}</span>
                  <span style={{ color: 'var(--text)' }}>{a.title}</span>
=======
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
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
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
<<<<<<< HEAD
        <div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {dashboardData.upcomingAppointments?.length > 0 ? (
              dashboardData.upcomingAppointments.map((a, i) => (
=======
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {Array.isArray(upcomingContext) && upcomingContext.length > 0 ? (
              upcomingContext.map((a, i) => (
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
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
<<<<<<< HEAD
                      {a.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{a.patientName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.type || 'Consultation'}</div>
=======
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
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
<<<<<<< HEAD
                      {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatTime(a.time)}</div>
=======
                      {a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{getTimeRange(a.time, a.duration)}</div>
                    <div style={{ 
                      fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 4, marginTop: '4px',
                      backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600, textAlign: 'center'
                    }}>{a.status || 'Scheduled'}</div>
>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
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

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Full Name</label>
                <input 
                  className="input-field" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Specialization</label>
                <input 
                  className="input-field" 
                  value={profileForm.specialization} 
                  onChange={e => setProfileForm({...profileForm, specialization: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Location</label>
                <input 
                  className="input-field" 
                  value={profileForm.location} 
                  onChange={e => setProfileForm({...profileForm, location: e.target.value})} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Date of Birth</label>
                  <input 
                    type="date"
                    className="input-field" 
                    value={profileForm.dob} 
                    onChange={e => setProfileForm({...profileForm, dob: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Blood Group</label>
                  <input 
                    className="input-field" 
                    value={profileForm.blood_group} 
                    onChange={e => setProfileForm({...profileForm, blood_group: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>Working Hours</label>
                <input 
                  className="input-field" 
                  value={profileForm.working_hours} 
                  placeholder="e.g. 9 AM - 5 PM"
                  onChange={e => setProfileForm({...profileForm, working_hours: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

<<<<<<< HEAD
=======
      {/* REQUEST MODAL */}
      {isRequestModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Availability Request</h3>
              <button onClick={() => setIsRequestModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                className={`btn ${requestType === 'Leave' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setRequestType('Leave')}
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                Apply for Leave
              </button>
              <button 
                className={`btn ${requestType === 'Schedule' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setRequestType('Schedule')}
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                Change Weekly Schedule
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requestType === 'Leave' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Select Dates & Slots</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input 
                        type="date" 
                        className="input-field" 
                        id="leave-date-picker"
                        min={new Date().toISOString().split('T')[0]}
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          const date = document.getElementById('leave-date-picker').value;
                          if (!date) return;
                          if (requestForm.leaveDates.some(ld => ld.date === date)) return;
                          setRequestForm({
                            ...requestForm,
                            leaveDates: [...requestForm.leaveDates, { date, fullDay: true, slots: [] }]
                          });
                        }}
                      >
                        Add Date
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                      {requestForm.leaveDates.map((ld, idx) => (
                        <div key={ld.date} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ld.date}</span>
                            <button 
                              type="button" 
                              onClick={() => {
                                setRequestForm({
                                  ...requestForm,
                                  leaveDates: requestForm.leaveDates.filter(d => d.date !== ld.date)
                                });
                              }}
                              style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <input 
                                type="radio" 
                                name={`day-type-${idx}`} 
                                checked={ld.fullDay} 
                                onChange={() => {
                                  const newDates = [...requestForm.leaveDates];
                                  newDates[idx].fullDay = true;
                                  newDates[idx].slots = [];
                                  setRequestForm({ ...requestForm, leaveDates: newDates });
                                }}
                              /> Full Day
                            </label>
                            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <input 
                                type="radio" 
                                name={`day-type-${idx}`} 
                                checked={!ld.fullDay} 
                                onChange={() => {
                                  const newDates = [...requestForm.leaveDates];
                                  newDates[idx].fullDay = false;
                                  setRequestForm({ ...requestForm, leaveDates: newDates });
                                }}
                              /> Partial (Slots)
                            </label>
                          </div>
                          {!ld.fullDay && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.4rem', marginTop: '0.5rem' }}>
                              {PREDEFINED_SLOTS.map(slot => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => {
                                    const newDates = [...requestForm.leaveDates];
                                    const slots = newDates[idx].slots;
                                    newDates[idx].slots = slots.includes(slot) ? slots.filter(s => s !== slot) : [...slots, slot].sort();
                                    setRequestForm({ ...requestForm, leaveDates: newDates });
                                  }}
                                  style={{
                                    padding: '0.3rem', fontSize: '0.7rem', borderRadius: '4px', border: '1px solid',
                                    borderColor: ld.slots.includes(slot) ? 'var(--primary)' : '#cbd5e1',
                                    backgroundColor: ld.slots.includes(slot) ? 'rgba(82, 178, 191, 0.1)' : 'white',
                                    color: ld.slots.includes(slot) ? 'var(--primary)' : '#64748b',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {requestForm.leaveDates.length === 0 && (
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', padding: '1rem' }}>No dates selected yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Requested Weekly Schedule</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {DAY_NAMES.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const currentDays = requestForm.availability.days || [];
                          const newDays = currentDays.includes(day) ? currentDays.filter(d => d !== day) : [...currentDays, day];
                          setRequestForm({ ...requestForm, availability: { ...requestForm.availability, days: newDays } });
                        }}
                        style={{
                          padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px', border: '1px solid',
                          borderColor: requestForm.availability.days.includes(day) ? 'var(--primary)' : '#cbd5e1',
                          backgroundColor: requestForm.availability.days.includes(day) ? 'var(--primary-light)' : 'white',
                          color: requestForm.availability.days.includes(day) ? 'var(--primary)' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {PREDEFINED_SLOTS.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          const currentSlots = requestForm.availability.timeSlots || [];
                          const newSlots = currentSlots.includes(slot) ? currentSlots.filter(s => s !== slot) : [...currentSlots, slot].sort();
                          setRequestForm({ ...requestForm, availability: { ...requestForm.availability, timeSlots: newSlots } });
                        }}
                        style={{
                          padding: '0.5rem', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid',
                          borderColor: requestForm.availability.timeSlots.includes(slot) ? 'var(--primary)' : '#e2e8f0',
                          backgroundColor: requestForm.availability.timeSlots.includes(slot) ? 'rgba(82, 178, 191, 0.1)' : 'white',
                          color: requestForm.availability.timeSlots.includes(slot) ? 'var(--primary)' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsRequestModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingRequest}>
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

>>>>>>> 9d9f59b08011a0a14c9c7c5033bc7d302786701a
    </div>
  );
};

export default DoctorDashboard;
