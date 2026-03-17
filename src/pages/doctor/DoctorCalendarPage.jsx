import React, { useState, useMemo, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser, FiCheckCircle, FiAlertCircle, FiXCircle, FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAppointment } from '../../context/AppointmentContext';
import { apiFetch } from '../../services/apiClient';

const DoctorCalendarPage = () => {
  const { userProfile } = useAuth();
  const { appointments } = useAppointment();
  const doctorName = userProfile?.name || 'Doctor';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [currentMonth, setCurrentMonth] = useState(startOfCurrentMonth);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchDoctorProfile = async () => {
    try {
      const data = await apiFetch('/doctors/profile');
      let dates = [];
      if (data.unavailable_dates) {
        dates = typeof data.unavailable_dates === 'string' 
          ? JSON.parse(data.unavailable_dates) 
          : data.unavailable_dates;
      }
      setUnavailableDates(dates);
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const selectedDateIso = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const isDateOnLeave = (date) => {
    if (!date) return false;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    return (unavailableDates || []).includes(iso);
  };

  const toggleLeave = async () => {
    const dateStr = selectedDateIso;
    const selDate = new Date(selectedDate);
    selDate.setHours(0,0,0,0);

    if (selDate < today) {
      showToast('Cannot manage leave for past dates', 'error');
      return;
    }

    setLoadingLeave(true);
    try {
      const res = await apiFetch('/doctors/leave', {
        method: 'POST',
        body: JSON.stringify({ date: dateStr })
      });
      setUnavailableDates(res.unavailable_dates);
      showToast(res.message);
    } catch (err) {
      showToast(err.message || 'Failed to update leave', 'error');
    } finally {
      setLoadingLeave(false);
    }
  };

  const myAppointmentsByDate = useMemo(() => {
    const map = {};
    (appointments || []).forEach(a => {
      const d = typeof a.date === 'string' ? a.date.split('T')[0] : a.date;
      if (!map[d]) map[d] = [];
      map[d].push(a);
    });
    return map;
  }, [appointments]);

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

  const myAppointmentsForDay = useMemo(() => {
    return (myAppointmentsByDate[selectedDateIso] || [])
      .filter(a => a.status !== 'Cancelled')
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [myAppointmentsByDate, selectedDateIso]);

  const isPastDate = selectedDate < today;

  return (
    <div className="layout-main">
      {toast && (
        <div style={{
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.75rem',
          backgroundColor: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          fontWeight: 600, animation: 'slideIn 0.3s ease'
        }}>
          {toast.type === 'error' ? <FiAlertCircle size={20} /> : <FiCheckCircle size={20} />}
          {toast.message}
        </div>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '1.25rem' }}>
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
              const isTodayCell = isSameDay(cell, today);
              const isSelected = isSameDay(cell, selectedDate);
              const leave = isDateOnLeave(cell);
              
              return (
                <button
                  key={cell.toISOString()}
                  onClick={() => setSelectedDate(cell)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    border: isSelected ? '2px solid var(--primary)' : leave ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? 'rgba(82,178,191,0.1)' : leave ? '#fef2f2' : (isTodayCell ? '#eff6ff' : '#f8fafc'),
                    color: leave ? '#dc2626' : (isTodayCell ? '#1e40af' : '#0f172a'),
                    fontWeight: isTodayCell ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isSelected ? 'var(--shadow-soft)' : 'none',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  title={cell.toLocaleDateString() + (leave ? ' (Leave)' : '')}
                >
                  <span style={{ fontSize: '1rem' }}>{cell.getDate()}</span>
                  
                  {leave && (
                    <div style={{ 
                      position: 'absolute', bottom: '6px', width: '4px', height: '4px', 
                      borderRadius: '50%', backgroundColor: '#ef4444' 
                    }}></div>
                  )}

                  {myAppointmentsByDate[cell.toISOString().split('T')[0]]?.filter(a => a.status !== 'Cancelled').length > 0 && !isSelected && (
                    <div style={{
                      position: 'absolute', top: '4px', right: '4px',
                      backgroundColor: leave ? '#ef4444' : 'var(--primary)', color: 'white',
                      fontSize: '0.6rem', fontWeight: 700,
                      width: '14px', height: '14px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid white'
                    }}>
                      {myAppointmentsByDate[cell.toISOString().split('T')[0]].filter(a => a.status !== 'Cancelled').length}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCalendar color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
              </div>
              
              {!isPastDate && (
                <button
                  onClick={toggleLeave}
                  disabled={loadingLeave}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: 10, border: 'none',
                    backgroundColor: isDateOnLeave(selectedDate) ? '#fee2e2' : 'rgba(82,178,191,0.1)',
                    color: isDateOnLeave(selectedDate) ? '#dc2626' : 'var(--primary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: loadingLeave ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
                    opacity: loadingLeave ? 0.7 : 1
                  }}
                >
                  {isDateOnLeave(selectedDate) ? (
                    <><FiXCircle /> Remove Leave</>
                  ) : (
                    <><FiZap /> Mark as Leave</>
                  )}
                </button>
              )}
            </div>

            {isDateOnLeave(selectedDate) && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 12, backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem'
              }}>
                <FiAlertCircle />
                <span>You are marked as <strong>on leave</strong> for this date. No new appointments can be booked.</span>
              </div>
            )}

            {myAppointmentsForDay.length === 0 ? (
              <div style={{ 
                padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', 
                backgroundColor: '#f8fafc', borderRadius: 16, border: '1px dashed #e2e8f0'
              }}>
                <FiCalendar size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: 500 }}>No scheduled appointments</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myAppointmentsForDay.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.85rem', borderRadius: 14, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(82,178,191,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                      }}>
                        <FiUser />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                          {a.patientName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FiClock size={12} /> {getTimeRange(a.time, a.duration)}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, borderRadius: 8, padding: '0.3rem 0.6rem',
                      backgroundColor: a.status === 'Completed' ? '#dcfce7' : a.status === 'Cancelled' ? '#fee2e2' : '#eff6ff',
                      color: a.status === 'Completed' ? '#166534' : a.status === 'Cancelled' ? '#991b1b' : '#1e40af',
                    }}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DoctorCalendarPage;
