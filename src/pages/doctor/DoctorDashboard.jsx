import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiBarChart2, FiEdit2, FiActivity } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
} from 'chart.js';

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

const PLANS = []; // Removing mock plans as requested

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
  const pieChartRef = useRef(null);
  const pieInstanceRef = useRef(null);

  const [loading, setLoading] = useState(true);
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

  // Fetch Dashboard Stats
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const data = await apiFetch('/dashboard/doctor');
        setDashboardData(data);
        setCalendarActivities(data.activities);
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
      } catch (err) {
        console.error('Failed to fetch doctor profile:', err);
      }
    };

    fetchDashboard();
    fetchProfile();
  }, []);

  // Fetch Appointments for Selected Date
  useEffect(() => {
    if (selectedDate.toDateString() === today.toDateString()) {
      setCalendarActivities(dashboardData.activities);
      return;
    }

    const fetchDayAppointments = async () => {
      setLoadingCalendar(true);
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const dateStr = selectedDate.toISOString().split('T')[0];
        const data = await apiFetch(`/appointments?date=${dateStr}`);
        setCalendarActivities(data.map(a => ({
          time: a.time,
          title: `Consultation: ${a.patientName}`
        })));
      } catch (err) {
        console.error('Failed to fetch calendar appointments:', err);
      } finally {
        setLoadingCalendar(false);
      }
    };

    fetchDayAppointments();
  }, [selectedDate, today, dashboardData.activities]);

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

  useEffect(() => {
    if (!pieChartRef.current || !dashboardData.scheduledEvents.labels.length) return;

    const ctx = pieChartRef.current.getContext('2d');
    if (pieInstanceRef.current) pieInstanceRef.current.destroy();

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

    return () => {
      if (pieInstanceRef.current) pieInstanceRef.current.destroy();
    };
  }, [dashboardData.scheduledEvents]);

  const doctorImageSrc = getDoctorImageSrc();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
      }}
    >
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
            Good Day Dr. {doctorFullName}!
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.95)', margin: 0 }}>
            Have a Nice {currentDayName}!
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
          { title: 'Offline Work', count: dashboardData.stats.offline, subtitle: 'Total Appointments', Icon: MdLocalHospital },
          { title: 'Online Work', count: dashboardData.stats.online, subtitle: 'Pending Consultations', Icon: FiActivity },
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
          <div style={{ height: 220, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dashboardData.scheduledEvents.labels.length > 0 ? (
              <canvas ref={pieChartRef} />
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No scheduled events</div>
            )}
          </div>
        </div>

        {/* MY PLANS DONE */}
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
              My Plans Done
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PLANS.map(({ label, percent }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{percent}%</span>
                </div>
                <div
                  style={{
                    height: 8,
                    backgroundColor: 'rgba(148,163,184,0.2)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            ))}
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
            <button type="button" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
              <FiEdit2 size={18} style={{ color: 'var(--primary)' }} />
            </button>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Dr. {doctorFullName}</div>
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '0.5rem' }}>{fullProfile?.specialization || 'Cardiologist'}</div>
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '1rem' }}>{fullProfile?.location || 'Kathmandu, Nepal'}</div>
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
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 1rem' }}>
          My Calendar
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {weekDays.map((d) => {
            const isSelected = d.toDateString() === selectedDateKey;
            const isToday = d.toDateString() === today.toDateString();
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
                }}
              >
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{DAY_NAMES[d.getDay()].slice(0, 3)}</div>
                <div>{d.getDate()}</div>
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
            {calendarActivities.length > 0 ? (
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
                  <span style={{ fontWeight: 600, color: 'var(--primary)', minWidth: 70 }}>{formatTime(a.time)}</span>
                  <span style={{ color: 'var(--text)' }}>{a.title}</span>
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
        <div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {dashboardData.upcomingAppointments?.length > 0 ? (
              dashboardData.upcomingAppointments.map((a, i) => (
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
                      {a.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{a.patientName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.type || 'Consultation'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
                      {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatTime(a.time)}</div>
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
    </div>
  );
};

export default DoctorDashboard;
