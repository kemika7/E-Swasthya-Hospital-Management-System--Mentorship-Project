import React, { useState, useMemo, useEffect } from 'react';
import { 
  FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser, 
  FiCheckCircle, FiAlertCircle, FiXCircle, FiZap, FiEdit3, FiSave, FiTrash2, FiActivity
} from 'react-icons/fi';
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
  const [calendarNotes, setCalendarNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchDoctorProfile = async () => {
    try {
      const data = await apiFetch('/doctors/profile');
      
      // Parse unavailable dates
      let dates = [];
      if (data.unavailable_dates) {
        dates = typeof data.unavailable_dates === 'string' 
          ? JSON.parse(data.unavailable_dates) 
          : data.unavailable_dates;
      }
      setUnavailableDates(dates);

      // Parse calendar notes
      let notes = {};
      if (data.calendar_notes) {
        notes = typeof data.calendar_notes === 'string'
          ? JSON.parse(data.calendar_notes)
          : data.calendar_notes;
      }
      setCalendarNotes(notes);
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

  const selectedDateIso = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  useEffect(() => {
    setCurrentNote(calendarNotes[selectedDateIso] || '');
    setIsEditingNote(false);
  }, [selectedDateIso, calendarNotes]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const goPrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
  };

  const goNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

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

  const toggleLeave = async () => {
    const dateStr = selectedDateIso;
    if (new Date(selectedDate) < today) {
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

  const saveNote = async () => {
    setLoadingNote(true);
    try {
      const res = await apiFetch('/doctors/calendar-notes', {
        method: 'POST',
        body: JSON.stringify({ date: selectedDateIso, notes: currentNote })
      });
      setCalendarNotes(res.calendar_notes);
      showToast('Note saved successfully!');
      setIsEditingNote(false);
    } catch (err) {
      showToast(err.message || 'Failed to save note', 'error');
    } finally {
      setLoadingNote(false);
    }
  };

  const appointmentsByDate = useMemo(() => {
    const map = {};
    (appointments || []).forEach(a => {
      const d = typeof a.date === 'string' ? a.date.split('T')[0] : a.date;
      if (!map[d]) map[d] = [];
      map[d].push(a);
    });
    return map;
  }, [appointments]);

  const dailyAppointments = useMemo(() => {
    return (appointmentsByDate[selectedDateIso] || [])
      .filter(a => a.status !== 'Cancelled')
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [appointmentsByDate, selectedDateIso]);

  return (
    <div className="layout-main" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)', padding: '1.5rem' }}>
      {toast && (
        <div className={`toast-box ${toast.type}`}>
          {toast.type === 'error' ? <FiAlertCircle size={20} /> : <FiCheckCircle size={20} />}
          {toast.message}
        </div>
      )}

      <div className="calendar-header-v2">
        <div className="header-text">
          <h2 className="title-blue">Swastha Calendar 📅</h2>
          <p className="subtitle">Plan your lovely month, {doctorName}!</p>
        </div>
        
        <div className="month-picker">
          <button className="cycle-btn" onClick={goPrevMonth}><FiChevronLeft /></button>
          <div className="current-month-display">{monthLabel}</div>
          <button className="cycle-btn" onClick={goNextMonth}><FiChevronRight /></button>
        </div>
      </div>

      <div className="calendar-container-v2">
        {/* LEFT: CALENDAR GRID */}
        <div className="calendar-glass-card main-grid-card">
          <div className="weekday-header">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="weekday-label">{d}</div>
            ))}
          </div>
          <div className="cells-grid">
            {calendarCells.map((cell, idx) => {
              if (!cell) return <div key={`empty-${idx}`} className="empty-cell" />;
              
              const isTodayCell = isSameDay(cell, today);
              const isSelected = isSameDay(cell, selectedDate);
              const dateStr = cell.toISOString().split('T')[0];
              const isOnLeave = (unavailableDates || []).includes(dateStr);
              const dayAppointments = (appointmentsByDate[dateStr] || []).filter(a => a.status !== 'Cancelled');
              const hasNote = !!calendarNotes[dateStr];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(cell)}
                  className={`calendar-cell-v2 ${isSelected ? 'selected' : ''} ${isTodayCell ? 'today' : ''} ${isOnLeave ? 'on-leave' : ''}`}
                >
                  <span className="date-num">{cell.getDate()}</span>
                  
                  <div className="indicators">
                    {isOnLeave && <div className="leave-dot" />}
                    {hasNote && <div className="note-dot" title="Has Note" />}
                  </div>

                  {dayAppointments.length > 0 && (
                    <div className="appt-count-badge">
                      {dayAppointments.length}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: DETAILS SIDEBAR */}
        <div className="calendar-sidebar">
          {/* Day Details Card */}
          <div className="sidebar-glass-card day-details-card">
            <div className="card-header">
              <div className="date-display">
                <FiCalendar className="primary-icon" />
                <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              
              {new Date(selectedDate) >= today && (
                <button 
                  className={`leave-toggle-btn ${isOnLeave(selectedDateIso) ? 'active' : ''}`}
                  onClick={toggleLeave}
                  disabled={loadingLeave}
                >
                  {isOnLeave(selectedDateIso) ? <FiCheckCircle /> : <FiZap />}
                  {isOnLeave(selectedDateIso) ? 'Vacation Mode' : 'Take Leave'}
                </button>
              )}
            </div>

            {isOnLeave(selectedDateIso) && (
              <div className="leave-alert-banner">
                <FiActivity />
                <span>Booking is closed for this date. Happy rest! 🌸</span>
              </div>
            )}

            <div className="appointments-section">
              <h4 className="section-title">Schedule</h4>
              {dailyAppointments.length === 0 ? (
                <div className="empty-state">
                  <p>No appointments today. ☕</p>
                </div>
              ) : (
                <div className="appt-list">
                  {dailyAppointments.map(a => (
                    <div key={a.id} className="appt-item-v2">
                      <div className="appt-info">
                        <strong>{a.patientName || 'Patient'}</strong>
                        <span><FiClock /> {a.start_time} - {a.duration} min</span>
                      </div>
                      <div className={`status-pill ${a.status.toLowerCase()}`}>{a.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          <div className="sidebar-glass-card notes-card">
            <div className="card-header">
              <h4 className="section-title"><FiEdit3 /> Personal Notes</h4>
              {!isEditingNote && currentNote && (
                <button className="icon-btn danger" onClick={() => { setCurrentNote(''); setIsEditingNote(true); }}>
                  <FiTrash2 />
                </button>
              )}
            </div>

            <div className="notes-container">
              {isEditingNote ? (
                <div className="edit-mode">
                  <textarea 
                    value={currentNote} 
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Write something special for this day..."
                    className="notes-textarea"
                    autoFocus
                  />
                  <div className="actions">
                    <button className="btn-cancel" onClick={() => { setIsEditingNote(false); setCurrentNote(calendarNotes[selectedDateIso] || ''); }}>Cancel</button>
                    <button className="btn-save" onClick={saveNote} disabled={loadingNote}>
                      {loadingNote ? '...' : <><FiSave /> Save</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="display-mode" onClick={() => setIsEditingNote(true)}>
                  {currentNote ? (
                    <div className="note-text">{currentNote}</div>
                  ) : (
                    <div className="note-placeholder">Click to add a note for this day... ✍️</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .calendar-header-v2 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }
        .title-blue {
          background: linear-gradient(to right, #2563eb, #3b82f6, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2.2rem;
          font-weight: 800;
          margin: 0;
        }
        .subtitle { color: #64748b; font-weight: 500; margin-top: 0.2rem; }
        
        .month-picker {
          display: flex;
          align-items: center;
          background: white;
          padding: 0.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          gap: 1rem;
        }
        .cycle-btn {
          border: none; background: #f1f5f9; width: 36px; height: 36px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s; color: #6366f1;
        }
        .cycle-btn:hover { background: #6366f1; color: white; }
        .current-month-display { font-weight: 700; color: #1e293b; min-width: 140px; text-align: center; }

        .calendar-container-v2 {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.5rem;
        }

        .calendar-glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          padding: 2rem;
        }

        .sidebar-glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          padding: 1.5rem;
          margin-bottom: 1.2rem;
        }

        .weekday-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem; margin-bottom: 1rem; }
        .weekday-label { text-align: center; font-size: 0.8rem; font-weight: 800; color: #94a3b8; }

        .cells-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem; }
        .calendar-cell-v2 {
          aspect-ratio: 1; border: none; background: white; border-radius: 20px;
          position: relative; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }
        .calendar-cell-v2:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .calendar-cell-v2.selected { background: #6366f1; color: white; transform: scale(1.1); z-index: 10; }
        .calendar-cell-v2.today { border: 2px solid #a855f7; }
        .calendar-cell-v2.on-leave { background: #fff1f2; }
        .date-num { font-size: 1.1rem; font-weight: 700; }

        .indicators { position: absolute; bottom: 10px; display: flex; gap: 4px; }
        .leave-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; }
        .note-dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; }
        .calendar-cell-v2.selected .note-dot { background: white; }

        .appt-count-badge {
          position: absolute; top: -6px; right: -6px; background: #ec4899;
          color: white; font-size: 0.7rem; font-weight: 800; width: 22px; height: 22px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          border: 2px solid white;
        }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .date-display { display: flex; alignItems: center; gap: 0.75rem; font-weight: 800; color: #1e293b; font-size: 1.1rem; }
        .primary-icon { color: #6366f1; }

        .leave-toggle-btn {
          border: none; padding: 0.5rem 1rem; border-radius: 15px; background: #f1f5f9;
          color: #64748b; font-size: 0.8rem; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 0.5rem; transition: 0.2s;
        }
        .leave-toggle-btn.active { background: #fee2e2; color: #ef4444; }
        
        .leave-alert-banner {
          background: #fff1f2; border: 1px dashed #fecaca; border-radius: 15px;
          padding: 1rem; color: #be123c; font-size: 0.85rem; display: flex; gap: 0.75rem;
          margin-bottom: 1.5rem; animation: bounceIn 0.5s;
        }

        .section-title { margin: 0; font-size: 1rem; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
        .empty-state { padding: 2rem 0; text-align: center; color: #94a3b8; }
        
        .appt-list { display: flex; flexDirection: column; gap: 0.8rem; }
        .appt-item-v2 {
          background: white; padding: 1rem; border-radius: 15px; display: flex;
          justify-content: space-between; align-items: center;
          border: 1px solid #f1f5f9; box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
        .appt-info { display: flex; flexDirection: column; }
        .appt-info strong { color: #1e293b; font-size: 0.95rem; }
        .appt-info span { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; display: flex; align-items: center; gap: 0.3rem; }

        .status-pill { font-size: 0.7rem; font-weight: 800; padding: 0.3rem 0.6rem; border-radius: 8px; }
        .status-pill.scheduled { background: #eff6ff; color: #3b82f6; }
        .status-pill.completed { background: #f0fdf4; color: #22c55e; }

        .notes-container { margin-top: 1rem; }
        .display-mode { min-height: 80px; padding: 1rem; background: rgba(99, 102, 241, 0.05); border-radius: 15px; cursor: pointer; transition: 0.2s; border: 1px dashed transparent; }
        .display-mode:hover { border-color: #6366f1; background: rgba(99, 102, 241, 0.08); }
        .note-placeholder { color: #94a3b8; font-style: italic; font-size: 0.9rem; }
        .note-text { color: #334155; font-size: 0.95rem; white-space: pre-wrap; line-height: 1.5; }

        .notes-textarea {
          width: 100%; min-height: 120px; border: 1px solid #e2e8f0; border-radius: 15px;
          padding: 1rem; font-family: inherit; font-size: 0.95rem; resize: none; margin-bottom: 1rem;
        }
        .actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
        .btn-cancel { border: none; background: #f1f5f9; color: #64748b; font-weight: 700; padding: 0.5rem 1rem; border-radius: 12px; cursor: pointer; }
        .btn-save { border: none; background: #6366f1; color: white; font-weight: 700; padding: 0.5rem 1rem; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

        .toast-box {
          position: fixed; top: 2rem; right: 2rem; z-index: 9999;
          padding: 1rem 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 0.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1); font-weight: 700; animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .toast-box.success { background: white; color: #166534; border: 1px solid #bbf7d0; }
        .toast-box.error { background: white; color: #991b1b; border: 1px solid #fecaca; }

        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
        
        @media (max-width: 1200px) {
          .calendar-container-v2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
  
  function isOnLeave(date) {
    return (unavailableDates || []).includes(date);
  }
};

export default DoctorCalendarPage;
