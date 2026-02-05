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

const PLANS = [
  { label: 'Consultations', percent: 64 },
  { label: 'Analysis', percent: 50 },
  { label: 'Meetings', percent: 33 },
];

const SCHEDULED_EVENTS_DATA = {
  labels: ['Consultations', 'Lab Analysis', 'Meetings'],
  values: [25, 10, 3],
};

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

const getActivitiesForDate = (dateKey) => {
  const activitiesByDay = {
    [new Date().toDateString()]: [
      { time: '2:00 pm', title: 'Meeting with Chief Physician' },
      { time: '2:30 pm', title: 'Consultation with Patient' },
      { time: '3:00 pm', title: 'Examination' },
    ],
  };
  return activitiesByDay[dateKey] || [
    { time: '9:00 am', title: 'Consultation' },
    { time: '11:00 am', title: 'Lab Review' },
  ];
};

const DoctorDashboard = () => {
  const { userProfile } = useAuth();
  const pieChartRef = useRef(null);
  const pieInstanceRef = useRef(null);

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
  const activities = getActivitiesForDate(selectedDateKey);

  useEffect(() => {
    if (!pieChartRef.current) return;

    const ctx = pieChartRef.current.getContext('2d');
    if (pieInstanceRef.current) pieInstanceRef.current.destroy();

    pieInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: SCHEDULED_EVENTS_DATA.labels,
        datasets: [
          {
            data: SCHEDULED_EVENTS_DATA.values,
            backgroundColor: ['var(--primary)', 'rgba(82,178,191,0.6)', 'rgba(82,178,191,0.3)'],
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
  }, [eventsFilter]);

  const doctorImageSrc = getDoctorImageSrc();

  return (
    <div
      style={{
        flex: 1,
        padding: '1.25rem 1.5rem 1.75rem',
        backgroundColor: 'var(--background)',
        minHeight: '100%',
      }}
    >
      {/* GREETING CARD */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: 16,
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
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
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { title: 'Offline Work', count: 30, subtitle: 'Hospital Patients', Icon: MdLocalHospital },
          { title: 'Online Work', count: 9, subtitle: 'Online Consultations', Icon: FiActivity },
          { title: 'Laboratory Work', count: 10, subtitle: 'Laboratory Analysis', Icon: FiBarChart2 },
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
          gap: '1.25rem',
          marginBottom: '1.25rem',
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
            <select
              value={eventsFilter}
              onChange={(e) => setEventsFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(23,23,16,0.12)',
                fontSize: '0.85rem',
                color: 'var(--text)',
                background: 'var(--white)',
              }}
            >
              <option value="Today">Today</option>
              <option value="Week">Week</option>
            </select>
          </div>
          <div style={{ height: 220, position: 'relative' }}>
            <canvas ref={pieChartRef} />
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
            <button
              type="button"
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 8,
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'var(--white)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Add plan +
            </button>
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
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '0.5rem' }}>Cardiologist</div>
            <div style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '1rem' }}>Kathmandu, Nepal</div>
            <div style={{ display: 'grid', gap: '0.35rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(23,23,16,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>Date of Birth</span>
                <span>Jan 15, 1985</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>Blood Group</span>
                <span>O+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>Working Hours</span>
                <span>9 AM - 5 PM</span>
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
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>
            Daily Activities – {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {activities.map((a, i) => (
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
                <span style={{ fontWeight: 600, color: 'var(--primary)', minWidth: 70 }}>{a.time}</span>
                <span style={{ color: 'var(--text)' }}>{a.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
