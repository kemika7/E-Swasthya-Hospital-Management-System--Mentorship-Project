import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiFetch } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import {
  FiPlus, FiActivity, FiHeart, FiDroplet, FiThermometer,
  FiTrendingUp, FiSave, FiList, FiGrid, FiCalendar,
  FiChevronDown, FiChevronUp, FiX, FiCheck, FiAlertTriangle, FiUser,
  FiZap, FiInfo, FiChevronRight, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { MdOutlineMonitorWeight, MdBloodtype, MdLocalFireDepartment, MdLocalDrink } from 'react-icons/md';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const calcBMI = (weight, height) => {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return null;
  return (w / (h * h)).toFixed(1);
};

const EMPTY_FORM = {
  weight: '', height: '', body_fat: '',
  blood_pressure_systolic: '', blood_pressure_diastolic: '',
  glucose_level: '', heart_rate: '', spo2: '',
  cholesterol_hdl: '', cholesterol_ldl: '',
  temperature: '', sleep_hours: '', water_intake: '',
  exercise_duration: '', notes: '',
  date: new Date().toLocaleDateString('en-CA'),
};

// ─── sub-components ─────────────────────────────────────────────────────────

const MetricCard = ({ title, value, unit, icon, color, trend }) => {
  const isStable = trend?.status === 'stable';
  const isIncreasing = trend?.status === 'increasing';
  const isDecreasing = trend?.status === 'decreasing';
  
  const getTrendColor = () => {
    if (isStable) return '#64748b';
    if (title === 'Weight') return isDecreasing ? '#22c55e' : '#f97316';
    if (title === 'Sleep' || title === 'Water') return isIncreasing ? '#22c55e' : '#ef4444';
    if (title === 'Heart Rate') return isIncreasing ? '#ef4444' : '#22c55e';
    return isIncreasing ? '#22c55e' : '#ef4444';
  };

  const TrendIcon = () => {
    if (isIncreasing) return <FiArrowUp size={12} />;
    if (isDecreasing) return <FiArrowDown size={12} />;
    if (isStable) return <span style={{ fontSize: '1rem', lineHeight: 1 }}>→</span>;
    return null;
  };

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: 20, padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '0.6rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ padding: '0.5rem', borderRadius: 12, backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
        {trend && trend.status !== 'not enough data' && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: 20,
            backgroundColor: `${getTrendColor()}15`, color: getTrendColor(), fontSize: '0.7rem', fontWeight: 800,
            border: `1px solid ${getTrendColor()}25`
          }}>
            <TrendIcon />
            {isStable ? 'STABLE' : Math.abs(trend.delta)}
          </div>
        )}
      </div>
      <div style={{ marginTop: '0.2rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{value || '0'}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{unit}</span>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, type = 'number', placeholder, value, onChange, step, optional }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
      {label}{optional && <span style={{ color: '#94a3b8', fontWeight: 400 }}> (opt)</span>}
    </label>
    <input
      type={type} step={step} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #e2e8f0',
        fontSize: '0.9rem', outline: 'none', backgroundColor: '#f8fafc',
        transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box'
      }}
      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
    />
  </div>
);

const HistoryTable = ({ records, highlightDate }) => {
  const getTrendIcon = (current, previous, lowIsBetter = true) => {
    if (previous === undefined || previous === null || current === null) return null;
    const diff = parseFloat((current - previous).toFixed(2));
    if (Math.abs(diff) < 0.1) return <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>→</span>;
    const improved = lowIsBetter ? diff < 0 : diff > 0;
    return (
      <span style={{ 
        color: improved ? '#22c55e' : '#ef4444', 
        display: 'inline-flex', alignItems: 'center', gap: '2px',
        fontSize: '0.75rem', fontWeight: 700,
        backgroundColor: improved ? '#22c55e15' : '#ef444415',
        padding: '1px 4px', borderRadius: 4
      }}>
        {diff > 0 ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
        {Math.abs(diff)}
      </span>
    );
  };

  if (!records.length) return (
    <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: 24, border: '1px solid #f1f5f9', color: '#94a3b8' }}>
      <FiList size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
      <p>No records found for the selected period.</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 24, padding: '1rem', border: '1px solid #f1f5f9', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f8fafc' }}>
            <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
            <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weight</th>
            <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Heart Rate</th>
            <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sleep</th>
            <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Water</th>
            <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Glucose</th>
            <th style={{ padding: '1.25rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SpO2</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row, idx) => {
            const prev = records[idx + 1]; // records are newest first
            const isHighlighted = highlightDate && row.created_at?.startsWith(highlightDate);
            return (
              <tr key={row.id} style={{ 
                borderBottom: '1px solid #f8fafc', 
                transition: 'all 0.2s ease',
                backgroundColor: isHighlighted ? '#e0f2fe' : 'transparent',
                outline: isHighlighted ? '2px solid #0284c7' : 'none'
              }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{fmt(row.created_at)}</td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 500 }}>
                    {row.weight || '--'} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>kg</span>
                    {getTrendIcon(row.weight, prev?.weight, true)}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 500 }}>
                    {row.heart_rate || '--'} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>bpm</span>
                    {getTrendIcon(row.heart_rate, prev?.heart_rate, true)}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 500 }}>
                    {row.sleep_hours || '--'} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>h</span>
                    {getTrendIcon(row.sleep_hours, prev?.sleep_hours, false)}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 500 }}>
                    {row.water_intake || '--'} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>L</span>
                    {getTrendIcon(row.water_intake, prev?.water_intake, false)}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', color: '#334155', fontWeight: 500 }}>
                  {row.glucose_level ? `${row.glucose_level} mg/dL` : '--'}
                </td>
                <td style={{ padding: '1.25rem 1rem', color: '#334155', fontWeight: 500 }}>
                  {row.spo2 ? `${row.spo2}%` : '--'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const DaySummary = ({ date, patientId, history, onClose }) => {
  const [dayAnalytics, setDayAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDayAnalytics = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/health-analytics/generate/${patientId}?date=${date}`);
        setDayAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch day analytics:', err);
        setDayAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    if (date && patientId) fetchDayAnalytics();
  }, [date, patientId]);

  const logIndex = history.findIndex(h => h.created_at?.startsWith(date));
  const log = history[logIndex];
  const prevLog = history[logIndex + 1];

  const trends = dayAnalytics?.trends || {};

  const getDayTrend = (key, current, previous, lowIsBetter = true) => {
    if (trends[key] && trends[key].status !== "not enough data") {
      const t = trends[key];
      const improved = lowIsBetter ? t.delta < 0 : t.delta > 0;
      if (t.status === 'stable') return <span style={{ color: '#94a3b8' }}>→</span>;
      return (
        <span style={{ color: improved ? '#22c55e' : '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem' }}>
          {t.status === 'increasing' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
          {Math.abs(t.delta)}
        </span>
      );
    }
    // Fallback to manual calc if AI didn't return specific trend for this key
    if (previous === undefined || previous === null || current === null) return null;
    const diff = parseFloat((current - previous).toFixed(2));
    if (Math.abs(diff) < 0.1) return <span style={{ color: '#94a3b8' }}>→</span>;
    const improved = lowIsBetter ? diff < 0 : diff > 0;
    return (
      <span style={{ color: improved ? '#22c55e' : '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem' }}>
        {diff > 0 ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
        {Math.abs(diff)}
      </span>
    );
  };

  if (!log && !loading) return (
    <div style={{ 
      backgroundColor: 'white', borderRadius: 24, padding: '1.5rem', 
      border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
      position: 'relative', animation: 'fadeInScale 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <button onClick={onClose} style={{ position: 'absolute', top: 15, right: 15, border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><FiX size={20} /></button>
      <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        <FiCalendar size={24} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: 0, color: '#0f172a' }}>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}</h4>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>No AI analysis available for this day.</p>
      </div>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: 'white', borderRadius: 24, padding: '1.5rem', 
      border: '2px solid #52b2bf', boxShadow: '0 10px 30px rgba(82,178,191,0.1)',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
      position: 'relative', animation: 'fadeInScale 0.3s ease',
      opacity: loading ? 0.7 : 1
    }}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <button onClick={onClose} style={{ position: 'absolute', top: 15, right: 15, border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><FiX size={20} /></button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}</h4>
          <span style={{ fontSize: '0.75rem', color: '#52b2bf', fontWeight: 700, textTransform: 'uppercase' }}>Daily AI Health Analysis</span>
        </div>
        
        {dayAnalytics && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Health Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: dayAnalytics.health_score > 70 ? '#22c55e' : '#f59e0b' }}>{dayAnalytics.health_score}</div>
            </div>
            <div style={{ 
              padding: '0.25rem 0.6rem', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800,
              backgroundColor: dayAnalytics.risk_level === 'Normal' ? '#22c55e15' : '#ef444415',
              color: dayAnalytics.risk_level === 'Normal' ? '#22c55e' : '#ef4444',
              border: '1px solid currentColor'
            }}>{dayAnalytics.risk_level.toUpperCase()}</div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          <FiActivity className="spin" size={32} style={{ marginBottom: '0.5rem' }} />
          <p>Analyzing health data...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
            {[
              { label: 'Weight', value: log.weight, unit: 'kg', icon: <MdOutlineMonitorWeight />, color: '#0284c7', lowIsBetter: true, key: 'weight' },
              { label: 'Heart Rate', value: log.heart_rate, unit: 'bpm', icon: <FiHeart />, color: '#ef4444', lowIsBetter: true, key: 'heart_rate' },
              { label: 'Sleep', value: log.sleep_hours, unit: 'h', icon: <FiUser />, color: '#6366f1', lowIsBetter: false, key: 'sleep_hours' },
              { label: 'Water', value: log.water_intake, unit: 'L', icon: <MdLocalDrink />, color: '#0ea5e9', lowIsBetter: false, key: 'water_intake' },
              { label: 'Glucose', value: log.glucose_level, unit: 'mg/dL', icon: <FiZap />, color: '#f59e0b', lowIsBetter: true, key: 'glucose_level' },
              { label: 'SpO2', value: log.spo2, unit: '%', icon: <FiActivity />, color: '#10b981', lowIsBetter: false, key: 'spo2' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '0.8rem', borderRadius: 16, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: m.color }}>{m.icon}</span>
                  {getDayTrend(m.key, m.value, prevLog?.[m.key], m.lowIsBetter)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                  {m.value || '--'} <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
          
          {dayAnalytics?.insights && (
            <div style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: 12, borderLeft: '4px solid #52b2bf' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#52b2bf', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                <FiZap size={14} /> AI Insights
              </div>
              {dayAnalytics.insights}
            </div>
          )}

          {log.notes && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
              Note: {log.notes}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const Reports = () => {
  const { userProfile } = useAuth();
  const firstName = userProfile?.name?.split(' ')[0] || 'User';
  
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'history' | 'add'
  const [history, setHistory] = useState([]);
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeFilter, setTimeFilter] = useState('Weekly'); // 'Weekly' | 'Monthly'
  const [form, setForm] = useState(EMPTY_FORM);
  const bmi = useMemo(() => calcBMI(form.weight, form.height), [form.weight, form.height]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/health/history');
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (date) => {
    if (!userProfile?.roleId) return;
    setAnalyticsLoading(true);
    try {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      const data = await apiFetch(`/health-analytics/generate/${userProfile.roleId}${query}`);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [userProfile?.roleId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.weight && !form.blood_pressure_systolic && !form.glucose_level) {
      showToast('Please fill in at least one measurement', 'error');
      return;
    }
    setSaving(true);
    try {
      const savedDate = form.date;
      await apiFetch('/health/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, bmi }),
      });
      showToast('Entry saved successfully!');
      setForm(EMPTY_FORM);
      setView('dashboard');
      setSelectedDate(savedDate);
      fetchHistory();
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (val) => setForm(prev => ({ ...prev, [field]: val }));
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD (Local Time)

  useEffect(() => {
    fetchAnalytics(selectedDate);
  }, [fetchAnalytics, selectedDate]);

  // ── data processing ────────────────────────────────────────────────────────
  const latest = history[0] || {};
  const selectedDateHasLog = useMemo(
    () => history.some(h => h.created_at?.startsWith(selectedDate)),
    [history, selectedDate]
  );
  
  // Chart Data
  const filteredHistory = useMemo(() => {
    if (!history.length) return [];
    const now = new Date();
    const days = timeFilter === 'Weekly' ? 7 : 30;
    const cutoff = new Date(now.setDate(now.getDate() - days));
    return history.filter(h => new Date(h.created_at) >= cutoff).reverse(); // oldest first for chart
  }, [history, timeFilter]);

  const chartLabels = filteredHistory.map(r => fmt(r.created_at));
  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Weight (kg)',
      data: filteredHistory.map(r => r.weight || null),
      borderColor: '#0284c7', // Teal/Blue
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(2, 132, 199, 0.4)');
        gradient.addColorStop(1, 'rgba(2, 132, 199, 0.0)');
        return gradient;
      },
      tension: 0.4, // Curved monotone line for smooth bezier
      fill: true,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#0284c7',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#fff',
        padding: 12, cornerRadius: 8, displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} kg`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, color: '#64748b' } } },
      y: { grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { size: 11, color: '#64748b' } } },
    },
    interaction: { intersect: false, mode: 'index' },
  };

  // Profile Sidebar Data
  const profileAge = userProfile?.age || latest.age || '--';
  const profileHeight = latest.height || '--';
  const profileWeight = latest.weight || '--';
  const profileBMI = latest.bmi ? parseFloat(latest.bmi).toFixed(1) : '--';
  
  // Calculate mock daily calories based on exercise directly or assume 2000 base
  const caloriesBurned = latest.exercise_duration ? (latest.exercise_duration * 8) : '--'; 

  return (
    <div style={{ display: 'flex', gap: '1.5rem', minHeight: 'calc(100vh - 100px)', paddingBottom: '2rem' }}>
      
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '0.85rem 1.25rem', borderRadius: 12,
          backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {toast.type === 'error' ? <FiAlertTriangle size={16} /> : <FiCheck size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              Good Morning, {firstName}! ☀️
            </h2>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              Here is your health overview.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {view === 'dashboard' && (
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: 12, padding: '0.25rem' }}>
                {['Weekly', 'Monthly'].map(tf => (
                  <button key={tf} onClick={() => setTimeFilter(tf)} style={{
                    padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                    backgroundColor: timeFilter === tf ? 'white' : 'transparent',
                    color: timeFilter === tf ? 'var(--primary)' : '#64748b',
                    boxShadow: timeFilter === tf ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                  }}>
                    {tf}
                  </button>
                ))}
              </div>
            )}
            
            <button onClick={() => setView('history')} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.25rem', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
              backgroundColor: view === 'history' ? '#f1f5f9' : 'white', 
              color: view === 'history' ? 'var(--primary)' : '#64748b',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}>
              <FiList size={16} /> History
            </button>

            <button onClick={() => setView('add')} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
              backgroundColor: 'var(--primary)', color: 'white',
              boxShadow: '0 4px 12px rgba(82,178,191,0.3)',
              whiteSpace: 'nowrap'
            }}>
              <FiPlus size={16} /> Add Entry
            </button>
            
            {view !== 'dashboard' && (
              <button onClick={() => setView('dashboard')} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.65rem 1.25rem', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
                backgroundColor: 'white', color: '#64748b',
                whiteSpace: 'nowrap'
              }}>
                <FiGrid size={16} /> Dashboard
              </button>
            )}
          </div>
        </div>

        {/* AI Health Insights Section */}
        {view === 'dashboard' && (
          <div style={{
            background: 'linear-gradient(135deg, #52b2bf 0%, #3d9ba8 100%)',
            borderRadius: 24, padding: '1.5rem', color: 'white',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', zIndex: 1, alignItems: 'center', opacity: analyticsLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  padding: '1.25rem', borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '4px solid #52b2bf44',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 80, height: 80, position: 'relative'
                }}>
                  <span style={{ fontSize: selectedDateHasLog ? '1.8rem' : '1rem', fontWeight: 800 }}>
                    {analyticsLoading ? '...' : (selectedDateHasLog ? (analytics?.health_score ?? '--') : 'NO DATA')}
                  </span>
                  <div style={{ 
                    position: 'absolute', bottom: -5, 
                    backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 10,
                    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                    backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
                  }}>Score</div>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>AI Health Assistant</h3>
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem',
                    padding: '0.25rem 0.75rem', borderRadius: 20, 
                    backgroundColor: analytics?.risk_level === 'Normal' ? '#065f4622' : '#991b1b22',
                    color: analytics?.risk_level === 'Normal' ? '#4ade80' : '#f87171',
                    fontSize: '0.8rem', fontWeight: 800, border: '1px solid currentColor'
                  }}>
                    {analyticsLoading ? <FiActivity className="spin" size={14} /> : (analytics?.risk_level === 'Normal' ? <FiCheck size={14} /> : <FiAlertTriangle size={14} />)}
                    {analyticsLoading ? 'ANALYZING...' : (selectedDateHasLog ? (analytics?.risk_level?.toUpperCase() || 'READY') : 'NO DATA')}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ zIndex: 1, fontSize: '0.8rem', opacity: 0.9 }}>
              Selected date: <strong>{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>
            </div>

            <div style={{ zIndex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                Personalized AI Insights
              </div>
              
              {!selectedDateHasLog ? (
                <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', fontWeight: 600 }}>
                  No data logged for this date.
                </p>
              ) : analytics?.insights ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {analytics.insights.split('.').filter(i => i.trim()).slice(0, expandedInsights ? undefined : 3).map((insight, idx) => {
                    const low = insight.toLowerCase();
                    let Icon = FiInfo;
                    if (low.includes('water')) Icon = MdLocalDrink;
                    if (low.includes('sleep') || low.includes('rest')) Icon = FiUser;
                    if (low.includes('heart') || low.includes('exercise')) Icon = FiActivity;
                    if (low.includes('sugar') || low.includes('glucose')) Icon = FiZap;
                    if (low.includes('oxygen') || low.includes('resp')) Icon = FiActivity;
                    
                    return (
                      <div key={idx} style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '1rem', 
                        display: 'flex', gap: '0.8rem', border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'transform 0.2s ease'
                      }}>
                        <div style={{ color: 'white', opacity: 0.9 }}><Icon size={18} /></div>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' }}>{insight.trim()}.</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Record more health data to get personalized AI tips.</p>
              )}

              {selectedDateHasLog && analytics?.insights?.split('.').length > 4 && (
                <button 
                  onClick={() => setExpandedInsights(!expandedInsights)}
                  style={{ 
                    marginTop: '1rem', background: 'none', border: 'none', color: 'white', 
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}
                >
                  {expandedInsights ? 'Show Less' : `Show ${analytics.insights.split('.').filter(i => i.trim()).length - 3} More Tips`} 
                  <FiChevronRight style={{ transform: expandedInsights ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                </button>
              )}
            </div>
            
            {selectedDateHasLog && analytics?.alerts && analytics.alerts !== 'None' && (
              <div style={{ 
                width: '100%', backgroundColor: '#ef444422', 
                borderRadius: 16, padding: '0.8rem 1.2rem', border: '1px solid #ef444444',
                display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 1
              }}>
                <FiAlertTriangle size={20} style={{ color: '#ef4444' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase' }}>Critical Health Alert</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{analytics.alerts}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Specific Day Spotlight */}
        {selectedDate && selectedDateHasLog && (
          <DaySummary 
            date={selectedDate} 
            patientId={userProfile?.roleId}
            history={history} 
            onClose={() => setSelectedDate(new Date().toISOString().split('T')[0])} 
          />
        )}

        {/* Bento Grid views */}
        {view === 'dashboard' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            
            {/* 4 Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              <MetricCard title="Water" value={latest.water_intake || '--'} unit="Liters" icon={<MdLocalDrink size={20} />} color="#0ea5e9" trend={analytics?.trends?.water_intake} />
              <MetricCard title="Calories" value={caloriesBurned} unit="kcal" icon={<MdLocalFireDepartment size={20} />} color="#f97316" />
              <MetricCard title="Heart Rate" value={latest.heart_rate || '--'} unit="BPM" icon={<FiHeart size={20} />} color="#ef4444" trend={analytics?.trends?.heart_rate} />
              <MetricCard title="Sleep" value={latest.sleep_hours || '--'} unit="Hours" icon={<FiUser size={20} />} color="#6366f1" trend={analytics?.trends?.sleep_hours} />
            </div>

            {/* Main Visual: Weight Trends Chart */}
            <div style={{
              backgroundColor: 'white', borderRadius: 24, padding: '1.5rem',
              border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              flex: 1, display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Weight Trends</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                   {analytics?.trends?.weight && analytics.trends.weight.status !== 'not enough data' && (
                     <div style={{ 
                       display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: 20,
                       backgroundColor: analytics.trends.weight.status === 'decreasing' ? '#22c55e15' : '#f9731615',
                       color: analytics.trends.weight.status === 'decreasing' ? '#22c55e' : '#f97316',
                       fontSize: '0.75rem', fontWeight: 800, border: '1px solid currentColor', borderOpacity: 0.1
                     }}>
                       {analytics.trends.weight.status === 'increasing' ? <FiArrowUp size={14} /> : 
                        analytics.trends.weight.status === 'decreasing' ? <FiArrowDown size={14} /> : '→'}
                       {Math.abs(analytics.trends.weight.delta)} kg
                     </div>
                   )}
                   <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                     {analytics?.trends?.weight?.message || 'Body Weight'}
                   </div>
                </div>
              </div>
              
              <div style={{ flex: 1, minHeight: 300 }}>
                {filteredHistory.length < 2 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '0.5rem' }}>
                    <FiTrendingUp size={32} opacity={0.5} />
                    <p>Not enough data for this period.</p>
                  </div>
                ) : (
                  <Line data={chartData} options={chartOpts} />
                )}
              </div>
            </div>

          </div>
        ) : view === 'history' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Historical Records</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Showing {timeFilter} Data
              </div>
            </div>
            <HistoryTable records={filteredHistory} highlightDate={selectedDate} />
          </div>
        ) : view === 'add' ? (
          <div style={{ 
            backgroundColor: 'white', borderRadius: 24, padding: '2rem',
            border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
          }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Add New Entry</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                <FormField label="Date" type="date" value={form.date} onChange={set('date')} />
                <FormField label="Weight (kg)" value={form.weight} onChange={set('weight')} />
                <FormField label="Height (cm)" value={form.height} onChange={set('height')} />
                
                <FormField label="BP Systolic" value={form.blood_pressure_systolic} onChange={set('blood_pressure_systolic')} optional />
                <FormField label="BP Diastolic" value={form.blood_pressure_diastolic} onChange={set('blood_pressure_diastolic')} optional />
                <FormField label="Heart Rate (BPM)" value={form.heart_rate} onChange={set('heart_rate')} optional />
                
                <FormField label="Blood Sugar" value={form.glucose_level} onChange={set('glucose_level')} optional />
                <FormField label="Water Intake (L)" step="0.1" value={form.water_intake} onChange={set('water_intake')} optional />
                <FormField label="Sleep (Hours)" value={form.sleep_hours} onChange={set('sleep_hours')} optional />
                
                <FormField label="Exercise (Mins)" value={form.exercise_duration} onChange={set('exercise_duration')} optional />
                <FormField label="Body Fat (%)" value={form.body_fat} onChange={set('body_fat')} optional />
                <FormField label="SpO2 (%)" value={form.spo2} onChange={set('spo2')} optional />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setView('dashboard')} style={{
                  padding: '0.85rem 1.5rem', borderRadius: 12, border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" disabled={saving} style={{
                  padding: '0.85rem 2.5rem', borderRadius: 12, border: 'none',
                  backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}>
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* Sticky Right Sidebar */}
      <div style={{ 
        width: '320px', flexShrink: 0, position: 'sticky', top: '2rem', height: 'fit-content',
        display: 'flex', flexDirection: 'column', gap: '1.5rem'
      }}>
        
        {/* Profile Info */}
        <div style={{
          backgroundColor: 'white', borderRadius: 24, padding: '2rem 1.5rem',
          border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
        }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%', backgroundColor: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}`} 
              alt="Profile avatar" style={{ width: '100%', borderRadius: '50%' }} 
            />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{userProfile?.name || 'User Profile'}</h3>
          <p style={{ margin: '0.3rem 0 1.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Age: {profileAge}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', width: '100%', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{profileWeight}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Weight (kg)</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{profileHeight}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Height (cm)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{profileBMI}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>BMI</div>
            </div>
          </div>
        </div>

        {/* Mini Calendar (Attendance / Logs) */}
        <div style={{
          backgroundColor: 'white', borderRadius: 24, padding: '1.5rem',
          border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Log Calendar</h3>
            <div style={{ padding: '0.4rem', borderRadius: 10, backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <FiCalendar size={16} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', textAlign: 'center', fontSize: '0.8rem' }}>
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <div key={i} style={{ color: '#94a3b8', fontWeight: 700, paddingBottom: '0.5rem' }}>{day}</div>
            ))}
            {Array.from({length: 14}).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (13 - i));
              const dtString = d.toLocaleDateString('en-CA');
              const hasLog = history.some(h => h.created_at?.startsWith(dtString));
              const isToday = i === 13;
              const isSelected = selectedDate === dtString;
              
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedDate(dtString);
                    if (hasLog && i < 7) setTimeFilter('Monthly'); // Ensure date is visible in trends if relevant
                  }}
                  style={{
                    aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '10px', fontSize: '0.85rem', fontWeight: (hasLog || isToday) ? 700 : 600,
                    backgroundColor: isToday ? 'var(--primary)' : isSelected ? '#0284c7' : hasLog ? '#bae6fd' : '#f8fafc',
                    color: (isToday || isSelected) ? 'white' : hasLog ? '#0284c7' : '#94a3b8',
                    border: isToday ? 'none' : hasLog ? '1px solid #bae6fd' : '1px solid transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 10px rgba(2, 132, 199, 0.4)' : 'none',
                    zIndex: isSelected ? 2 : 1
                  }}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
          <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: '#0284c7', textAlign: 'center', fontWeight: 600 }}>
            Active the past 14 days
          </p>
        </div>

      </div>
    </div>
  );
};

const spinStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    display: inline-block;
    animation: spin 2s linear infinite;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinStyle;
  document.head.appendChild(style);
}

export default Reports;
