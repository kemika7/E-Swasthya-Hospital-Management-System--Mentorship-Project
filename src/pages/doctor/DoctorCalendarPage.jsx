import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from 'react-icons/fi';

const DoctorCalendarPage = () => {
  const { userProfile } = useAuth();
  const { appointments } = useAdmin();
  const doctorName = userProfile?.name || 'Doctor';

  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [currentMonth, setCurrentMonth] = useState(startOfCurrentMonth);
  const [selectedDate, setSelectedDate] = useState(today);

  const MAX_MONTHS_AHEAD = 3;

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const canGoPrev = useMemo(() => {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonth > start;
  }, [currentMonth, today]);

  const canGoNext = useMemo(() => {
    const max = new Date(today.getFullYear(), today.getMonth() + MAX_MONTHS_AHEAD, 1);
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return next <= max;
  }, [currentMonth, today]);

  const goPrevMonth = () => {
    if (!canGoPrev) return;
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
    setSelectedDate(new Date(prev.getFullYear(), prev.getMonth(), 1));
  };

  const goNextMonth = () => {
    if (!canGoNext) return;
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
    setSelectedDate(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0..6

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDayIndex = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
    }
    return cells;
  }, [firstDayIndex, daysInMonth, currentMonth]);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const selectedDateIso = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const myAppointmentsForDay = useMemo(() => {
    return (appointments || []).filter(
      (a) => a.doctorName === doctorName && a.date === selectedDateIso
    );
  }, [appointments, doctorName, selectedDateIso]);

  return (
    <div className="layout-main">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">My Calendar</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>View and manage your monthly schedule</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-outline"
            onClick={goPrevMonth}
            disabled={!canGoPrev}
            style={{ opacity: canGoPrev ? 1 : 0.5, padding: '0.4rem' }}
            title="Previous month"
          >
            <FiChevronLeft />
          </button>
          <div
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 8,
              backgroundColor: '#f1f5f9',
              fontWeight: 600,
            }}
          >
            {monthLabel}
          </div>
          <button
            className="btn btn-outline"
            onClick={goNextMonth}
            disabled={!canGoNext}
            style={{ opacity: canGoNext ? 1 : 0.5, padding: '0.4rem' }}
            title="Next month"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
        {/* Calendar Card */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {calendarCells.map((cell, idx) => {
              if (!cell) return <div key={`empty-${idx}`} />;
              const isToday = isSameDay(cell, today);
              const isSelected = isSameDay(cell, selectedDate);
              return (
                <button
                  key={cell.toISOString()}
                  onClick={() => setSelectedDate(cell)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? 'rgba(82,178,191,0.1)' : '#f8fafc',
                    color: '#0f172a',
                    fontWeight: isToday ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isSelected ? 'var(--shadow-soft)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title={cell.toLocaleDateString()}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule Panel */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FiCalendar />
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              Daily Activities – {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}, {selectedDate.toLocaleDateString('en-US')}
            </h3>
          </div>

          {myAppointmentsForDay.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No scheduled activities for this day
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myAppointmentsForDay.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 12,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(82,178,191,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                      }}
                    >
                      <FiClock />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        Appointment with {a.patientName}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {a.time} • {a.type} • {a.status}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color:
                          a.status === 'Completed'
                            ? '#22c55e'
                            : a.status === 'Cancelled'
                            ? '#ef4444'
                            : '#3b82f6',
                        backgroundColor:
                          a.status === 'Completed'
                            ? '#22c55e15'
                            : a.status === 'Cancelled'
                            ? '#ef444415'
                            : '#3b82f615',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 6,
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendarPage;
