import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiFetch } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import {
  FiPlus, FiActivity, FiHeart, FiDroplet, FiThermometer,
  FiTrendingUp, FiSave, FiList, FiGrid, FiCalendar,
  FiChevronDown, FiChevronUp, FiX, FiCheck, FiAlertTriangle, FiUser
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
  date: new Date().toISOString().split('T')[0],
};

// ─── sub-components ─────────────────────────────────────────────────────────

const MetricCard = ({ title, value, unit, icon, color }) => (
  <div style={{
    backgroundColor: 'white', borderRadius: 20, padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{title}</span>
      <div style={{ padding: '0.4rem', borderRadius: 10, backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.2rem' }}>
      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{value || '0'}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>{unit}</span>
    </div>
  </div>
);

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

// ─── main component ──────────────────────────────────────────────────────────

const Reports = () => {
  const { userProfile } = useAuth();
  const firstName = userProfile?.name?.split(' ')[0] || 'User';
  
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'history' | 'add'
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
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
      await apiFetch('/health/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, bmi }),
      });
      showToast('Entry saved successfully!');
      setForm(EMPTY_FORM);
      setView('dashboard');
      fetchHistory();
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (val) => setForm(prev => ({ ...prev, [field]: val }));

  // ── data processing ────────────────────────────────────────────────────────
  const latest = history[0] || {};
  
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
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
            
            <button onClick={() => setView('add')} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
              backgroundColor: 'var(--primary)', color: 'white',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            }}>
              <FiPlus size={16} /> Add Entry
            </button>
            {view !== 'dashboard' && (
              <button onClick={() => setView('dashboard')} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.65rem 1.25rem', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
                backgroundColor: 'white', color: '#64748b',
              }}>
                <FiGrid size={16} /> Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Bento Grid views */}
        {view === 'dashboard' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            
            {/* 4 Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              <MetricCard title="Water" value={latest.water_intake || '--'} unit="Liters" icon={<MdLocalDrink size={20} />} color="#0ea5e9" />
              <MetricCard title="Calories Burned" value={caloriesBurned} unit="kcal" icon={<MdLocalFireDepartment size={20} />} color="#f97316" />
              <MetricCard title="Heart Rate" value={latest.heart_rate || '--'} unit="BPM" icon={<FiHeart size={20} />} color="#ef4444" />
              <MetricCard title="Sleep" value={latest.sleep_hours || '--'} unit="Hours" icon={<FiUser size={20} />} color="#6366f1" />
            </div>

            {/* Main Visual: Weight Trends Chart */}
            <div style={{
              backgroundColor: 'white', borderRadius: 24, padding: '1.5rem',
              border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              flex: 1, display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Weight Trends</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#0284c7' }}></div>
                  Body Weight
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
              const dtString = d.toISOString().split('T')[0];
              const hasLog = history.some(h => h.created_at?.startsWith(dtString));
              const isToday = i === 13;
              
              return (
                <div key={i} style={{
                  aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '10px', fontSize: '0.85rem', fontWeight: hasLog ? 700 : 600,
                  backgroundColor: isToday ? 'var(--primary)' : hasLog ? '#e0f2fe' : '#f8fafc',
                  color: isToday ? 'white' : hasLog ? '#0284c7' : '#94a3b8',
                  border: isToday ? 'none' : hasLog ? '1px solid #bae6fd' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}>
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

export default Reports;
