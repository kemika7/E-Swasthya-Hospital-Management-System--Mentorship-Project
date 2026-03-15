import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiActivity, 
  FiHeart, 
  FiDroplet, 
  FiThermometer, 
  FiMoon, 
  FiTrendingUp,
  FiInfo,
  FiSave,
  FiUser,
  FiClock,
  FiShield,
  FiEye,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

const Reports = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'form'
  
  // Health Data State
  const [healthData, setHealthData] = useState(() => {
    const saved = localStorage.getItem('patient_health_data');
    return saved ? JSON.parse(saved) : {
      personal: { age: '', gender: '', bloodGroup: '', height: '', weight: '' },
      lifestyle: { exercise: false, exerciseDuration: '', smoking: false, alcohol: false, sleepHours: '', waterIntake: '' },
      medical: { conditions: '', allergies: '', surgeries: '', medications: '' },
      vitals: { systolic: '', diastolic: '', bpm: '', sugar: '', hdl: '', ldl: '', spo2: '', temperature: '' },
      notes: '',
      history: []
    };
  });

  // Calculate BMI and Status
  const bmiInfo = useMemo(() => {
    const weight = parseFloat(healthData.personal.weight);
    const height = parseFloat(healthData.personal.height) / 100; // cm to m
    if (weight > 0 && height > 0) {
      const bmi = (weight / (height * height)).toFixed(1);
      let category = '';
      let status = ''; // healthy, borderline, requires_attention
      if (bmi < 18.5) { category = 'Underweight'; status = 'borderline'; }
      else if (bmi < 25) { category = 'Normal'; status = 'healthy'; }
      else if (bmi < 30) { category = 'Overweight'; status = 'borderline'; }
      else { category = 'Obese'; status = 'requires_attention'; }
      return { bmi, category, status };
    }
    return null;
  }, [healthData.personal.weight, healthData.personal.height]);

  const getStatusColor = (status) => {
    switch(status) {
        case 'healthy': return 'var(--success)';
        case 'borderline': return '#f97316'; // Orange
        case 'requires_attention': return 'var(--error)';
        default: return 'var(--text-light)';
    }
  };

  const handleInputChange = (section, field, value) => {
    setHealthData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simple validation
    if (!healthData.personal.weight || !healthData.personal.height) {
        alert("Please enter height and weight for tracking.");
        return;
    }

    const newData = { 
      ...healthData, 
      history: [
        ...healthData.history, 
        { 
          date: new Date().toLocaleDateString(), 
          weight: healthData.personal.weight,
          bmi: bmiInfo?.bmi,
          bpm: healthData.vitals.bpm,
          bp: `${healthData.vitals.systolic}/${healthData.vitals.diastolic}`,
          sugar: healthData.vitals.sugar,
          water: healthData.lifestyle.waterIntake,
          sleep: healthData.lifestyle.sleepHours,
          exercise: healthData.lifestyle.exerciseDuration
        }
      ].slice(-14) // Keep last 14 entries
    };
    setHealthData(newData);
    localStorage.setItem('patient_health_data', JSON.stringify(newData));
    setView('dashboard');
  };

  // Chart Configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  const trendData = (label, dataField, color) => ({
    labels: healthData.history.map(h => h.date),
    datasets: [{
      label: label,
      data: healthData.history.map(h => h[dataField]),
      borderColor: color,
      backgroundColor: color + '20',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  });

  return (
    <main className="layout-main" style={{ paddingBottom: '3rem' }}>
      {/* HEADER SECTION */}
      <div className="page-header" style={{ 
        backgroundColor: 'var(--primary)', borderRadius: 20, padding: '1.25rem', 
        marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button onClick={() => navigate('/patient/dashboard')} className="btn" style={{ 
            width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', 
            color: 'white', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <FiArrowLeft size={22} />
            </button>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Health Tracker</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Monitor your vitals and daily habits</p>
            </div>
        </div>
        <button onClick={() => setView(view === 'dashboard' ? 'form' : 'dashboard')} 
            className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: 700, padding: '0.75rem 1.5rem', borderRadius: 14 }}>
            {view === 'dashboard' ? <><FiPlus style={{ marginRight: 8 }} /> Update Record</> : <><FiActivity style={{ marginRight: 8 }} /> Dashboard</>}
        </button>
      </div>

      {view === 'dashboard' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
          
          {/* SUMMARY & BMI CARD */}
          <section className="card md:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card-header">
                <h3 className="card-title">Body Composition</h3>
                <FiUser color="var(--primary)" />
            </div>
            {bmiInfo ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: getStatusColor(bmiInfo.status), lineHeight: 1 }}>{bmiInfo.bmi}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-light)', marginTop: '0.5rem' }}>Body Mass Index (BMI)</div>
                <div className="tag" style={{ 
                    backgroundColor: getStatusColor(bmiInfo.status) + '15', 
                    color: getStatusColor(bmiInfo.status),
                    marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: 20, fontSize: '1rem', fontWeight: 700
                }}>
                    {bmiInfo.category}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem', borderTop: '1px solid var(--background)', paddingTop: '1.5rem' }}>
                    <div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 600 }}>HEIGHT</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{healthData.personal.height} cm</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 600 }}>WEIGHT</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{healthData.personal.weight} kg</div>
                    </div>
                </div>
              </div>
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic' }}>
                Enter your height and weight to see your BMI analysis and trends.
              </div>
            )}
          </section>

          {/* QUICK VITALS STATS */}
          <div className="grid grid-cols-2 lg:col-span-2" style={{ gap: '1rem' }}>
            <MetricCard 
                icon={<FiHeart color="var(--error)" />} 
                label="Heart Rate" 
                value={healthData.vitals.bpm || '--'} 
                unit="BPM" 
                status={parseInt(healthData.vitals.bpm) > 100 || parseInt(healthData.vitals.bpm) < 60 ? 'borderline' : 'healthy'}
            />
            <MetricCard 
                icon={<FiActivity color="var(--primary)" />} 
                label="Blood Pressure" 
                value={healthData.vitals.systolic ? `${healthData.vitals.systolic}/${healthData.vitals.diastolic}` : '--'} 
                unit="mmHg" 
                status={parseInt(healthData.vitals.systolic) > 130 ? 'requires_attention' : 'healthy'}
            />
            <MetricCard 
                icon={<FiDroplet color="#f97316" />} 
                label="Sugar Level" 
                value={healthData.vitals.sugar || '--'} 
                unit="mg/dL" 
                status={parseInt(healthData.vitals.sugar) > 140 ? 'borderline' : 'healthy'}
            />
            <MetricCard 
                icon={<FiShield color="#8b5cf6" />} 
                label="SpO2 Level" 
                value={healthData.vitals.spo2 || '--'} 
                unit="%" 
                status={parseInt(healthData.vitals.spo2) < 95 ? 'requires_attention' : 'healthy'}
            />
            <MetricCard 
                icon={<FiEye color="#06b6d4" />} 
                label="Cholesterol (LDL)" 
                value={healthData.vitals.ldl || '--'} 
                unit="mg/dL" 
                status={parseInt(healthData.vitals.ldl) > 100 ? 'borderline' : 'healthy'}
            />
            <MetricCard 
                icon={<FiThermometer color="#ef4444" />} 
                label="Temperature" 
                value={healthData.vitals.temperature || '--'} 
                unit="°C" 
                status={parseFloat(healthData.vitals.temperature) > 37.5 ? 'borderline' : 'healthy'}
            />
          </div>

          {/* MAIN TREND CHARTS */}
          <section className="card md:col-span-2 lg:col-span-2">
            <div className="card-header">
                <div>
                    <h3 className="card-title">Weight & BMI Trend</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-light)' }}>Last {healthData.history.length || 0} measurements</p>
                </div>
                <FiTrendingUp color="var(--primary)" size={20} />
            </div>
            <div style={{ height: 280, marginTop: '1rem' }}>
                {healthData.history.length > 0 ? (
                    <Line 
                        data={{
                            labels: healthData.history.map(h => h.date),
                            datasets: [
                                {
                                    label: 'Weight (kg)',
                                    data: healthData.history.map(h => h.weight),
                                    borderColor: 'var(--primary)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                },
                                {
                                    label: 'BMI',
                                    data: healthData.history.map(h => h.bmi),
                                    borderColor: '#10b981',
                                    backgroundColor: 'transparent',
                                    tension: 0.4,
                                    borderDash: [5, 5]
                                }
                            ]
                        }} 
                        options={chartOptions} 
                    />
                ) : <EmptyState message="No tracking data yet. Start recording your vitals to see trends." />}
            </div>
          </section>

          {/* HABITS & GOALS */}
          <section className="card">
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="card-title">Daily Habits</h3>
                <FiClock color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <HabitTracker 
                    icon={<FiDroplet />} 
                    label="Water Consumption" 
                    current={healthData.lifestyle.waterIntake} 
                    goal={3.5} 
                    unit="L" 
                    color="#3b82f6" 
                />
                <HabitTracker 
                    icon={<FiMoon />} 
                    label="Sleep Duration" 
                    current={healthData.lifestyle.sleepHours} 
                    goal={8} 
                    unit="hrs" 
                    color="#6366f1" 
                />
                <HabitTracker 
                    icon={<FiActivity />} 
                    label="Exercise Duration" 
                    current={healthData.lifestyle.exerciseDuration} 
                    goal={45} 
                    unit="min" 
                    color="#10b981" 
                />
            </div>
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <FiAlertCircle color="#f97316" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Pro Tip</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.5 }}>
                    Consistency is key! Logging your data daily helps in identifying patterns early.
                </p>
            </div>
          </section>

          {/* SECONDARY TRENDS */}
          <section className="card md:col-span-2 lg:col-span-3">
             <div className="card-header">
                <h3 className="card-title">Vital Signs Trend (Historical)</h3>
                <FiHeart color="var(--error)" />
            </div>
            <div style={{ height: 220, marginTop: '1rem' }}>
                {healthData.history.length > 0 ? (
                    <Line 
                        data={{
                            labels: healthData.history.map(h => h.date),
                            datasets: [
                                {
                                    label: 'Heart Rate (BPM)',
                                    data: healthData.history.map(h => h.bpm),
                                    borderColor: 'var(--error)',
                                    backgroundColor: 'transparent',
                                    tension: 0.4
                                },
                                {
                                    label: 'Blood Sugar',
                                    data: healthData.history.map(h => h.sugar),
                                    borderColor: '#f97316',
                                    backgroundColor: 'transparent',
                                    tension: 0.4
                                }
                            ]
                        }} 
                        options={chartOptions} 
                    />
                ) : <EmptyState message="Historical trends will appear here once you've saved multiple updates." />}
            </div>
          </section>
        </div>
      ) : (
        /* HEALTH RECORD FORM */
        <form onSubmit={handleSave} style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '2rem' }}>
            {/* Personal Section */}
            <CardSection title="Personal Info" icon={<FiUser />}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                      <FormInput label="Age" type="number" placeholder="Years" value={healthData.personal.age} onChange={v => handleInputChange('personal', 'age', v)} />
                      <FormSelect label="Gender" options={['Male', 'Female', 'Other']} value={healthData.personal.gender} onChange={v => handleInputChange('personal', 'gender', v)} />
                  </div>
                  <FormSelect label="Blood Group" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} value={healthData.personal.bloodGroup} onChange={v => handleInputChange('personal', 'bloodGroup', v)} />
                  <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                      <FormInput label="Height (cm)" type="number" placeholder="Ex: 175" value={healthData.personal.height} onChange={v => handleInputChange('personal', 'height', v)} />
                      <FormInput label="Weight (kg)" type="number" placeholder="Ex: 70" value={healthData.personal.weight} onChange={v => handleInputChange('personal', 'weight', v)} />
                  </div>
                  <div style={{ 
                      padding: '1.25rem', backgroundColor: 'var(--background)', borderRadius: 14, borderLeft: '5px solid var(--primary)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>Estimated BMI</span>
                      <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{bmiInfo?.bmi || '--'}</span>
                  </div>
              </div>
            </CardSection>

            {/* Vital Signs Section */}
            <CardSection title="Vital Signs" icon={<FiActivity />}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                      <FormInput label="BP Systolic" type="number" placeholder="Ex: 120" value={healthData.vitals.systolic} onChange={v => handleInputChange('vitals', 'systolic', v)} />
                      <FormInput label="BP Diastolic" type="number" placeholder="Ex: 80" value={healthData.vitals.diastolic} onChange={v => handleInputChange('vitals', 'diastolic', v)} />
                  </div>
                  <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                      <FormInput label="Heart Rate" type="number" placeholder="BPM" value={healthData.vitals.bpm} onChange={v => handleInputChange('vitals', 'bpm', v)} />
                      <FormInput label="Blood Sugar" type="number" placeholder="mg/dL" value={healthData.vitals.sugar} onChange={v => handleInputChange('vitals', 'sugar', v)} />
                  </div>
                  <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                      <FormInput label="SpO2 %" type="number" placeholder="%" value={healthData.vitals.spo2} onChange={v => handleInputChange('vitals', 'spo2', v)} />
                      <FormInput label="HDL" type="number" value={healthData.vitals.hdl} onChange={v => handleInputChange('vitals', 'hdl', v)} />
                      <FormInput label="LDL" type="number" value={healthData.vitals.ldl} onChange={v => handleInputChange('vitals', 'ldl', v)} />
                  </div>
                  <FormInput label="Temperature (°C)" type="number" step="0.1" placeholder="Ex: 36.8" value={healthData.vitals.temperature} onChange={v => handleInputChange('vitals', 'temperature', v)} />
              </div>
            </CardSection>

            {/* Lifestyle Section */}
            <CardSection title="Lifestyle & Habits" icon={<FiClock />}>
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <FormToggle label="Smoker" active={healthData.lifestyle.smoking} onToggle={v => handleInputChange('lifestyle', 'smoking', v)} />
                        <FormToggle label="Alcohol" active={healthData.lifestyle.alcohol} onToggle={v => handleInputChange('lifestyle', 'alcohol', v)} />
                    </div>
                    <FormInput label="Exercise Duration (min/day)" type="number" value={healthData.lifestyle.exerciseDuration} onChange={v => handleInputChange('lifestyle', 'exerciseDuration', v)} />
                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <FormInput label="Sleep Hours" type="number" value={healthData.lifestyle.sleepHours} onChange={v => handleInputChange('lifestyle', 'sleepHours', v)} />
                        <FormInput label="Water Intake (L)" type="number" step="0.1" value={healthData.lifestyle.waterIntake} onChange={v => handleInputChange('lifestyle', 'waterIntake', v)} />
                    </div>
                </div>
            </CardSection>

            {/* Medical History Section */}
            <CardSection title="History & Notes" icon={<FiInfo />}>
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <FormTextArea label="Chronic Conditions" placeholder="List any existing conditions..." value={healthData.medical.conditions} onChange={v => handleInputChange('medical', 'conditions', v)} />
                    <FormTextArea label="Current Medications" placeholder="Dosage and frequency..." value={healthData.medical.medications} onChange={v => handleInputChange('medical', 'medications', v)} />
                    <FormInput label="Allergies" placeholder="Food, drug, environment..." value={healthData.medical.allergies} onChange={v => handleInputChange('medical', 'allergies', v)} />
                </div>
            </CardSection>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setView('dashboard')} className="btn" style={{ padding: '0.8rem 2rem', fontWeight: 600 }}>
                Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 3rem', fontWeight: 700, borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiSave size={20} /> Save Health Record
            </button>
          </div>
        </form>
      )}
    </main>
  );
};

/* HELPER COMPONENTS */

const MetricCard = ({ icon, label, value, unit, status }) => {
    const getStatusInfo = (s) => {
        switch(s) {
            case 'healthy': return { color: 'var(--success)', icon: <FiInfo size={14} />, tip: 'Looking good!' };
            case 'borderline': return { color: '#f97316', icon: <FiAlertCircle size={14} />, tip: 'Monitor closely' };
            case 'requires_attention': return { color: 'var(--error)', icon: <FiAlertCircle size={14} />, tip: 'Consult doctor' };
            default: return { color: 'var(--text-light)', icon: null, tip: '' };
        }
    };
    const info = getStatusInfo(status);

    return (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <div title={info.tip} style={{ color: info.color }}>{info.icon}</div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    {value} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-light)' }}>{unit}</span>
                </div>
            </div>
        </div>
    );
};

const HabitTracker = ({ icon, label, current, goal, unit, color }) => {
    const percentage = Math.min(100, (parseFloat(current || 0) / goal) * 100);
    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                    <span style={{ color: color }}>{icon}</span> {label}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)' }}>{current || 0}/{goal} {unit}</span>
            </div>
            <div style={{ width: '100%', height: 10, backgroundColor: 'var(--background)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ 
                    width: `${percentage}%`, height: '100%', backgroundColor: color, 
                    borderRadius: 5, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}></div>
            </div>
        </div>
    );
};

const CardSection = ({ title, icon, children }) => (
    <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--primary)' }}>{icon}</div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
        </div>
        {children}
    </div>
);

const FormInput = ({ label, type = 'text', step, placeholder, value, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)' }}>{label}</label>
        <input 
            type={type} 
            step={step}
            className="input" 
            placeholder={placeholder}
            value={value} 
            onChange={e => onChange(e.target.value)}
            style={{ borderRadius: 12, padding: '0.75rem 1rem' }}
        />
    </div>
);

const FormSelect = ({ label, options, value, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)' }}>{label}</label>
        <select 
            className="select" 
            value={value} 
            onChange={e => onChange(e.target.value)}
            style={{ borderRadius: 12, padding: '0.75rem 1rem' }}
        >
            <option value="">Select Option</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FormTextArea = ({ label, placeholder, value, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)' }}>{label}</label>
        <textarea 
            className="input" 
            placeholder={placeholder}
            rows={3}
            value={value} 
            onChange={e => onChange(e.target.value)}
            style={{ borderRadius: 12, padding: '0.75rem 1rem', minHeight: '100px', resize: 'vertical' }}
        />
    </div>
);

const FormToggle = ({ label, active, onToggle }) => (
    <div 
        onClick={() => onToggle(!active)}
        style={{ 
            padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid var(--background)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
            backgroundColor: active ? 'rgba(59, 130, 246, 0.05)' : 'white',
            borderColor: active ? 'var(--primary)' : 'var(--background)'
        }}
    >
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
        <div style={{ 
            width: 40, height: 22, borderRadius: 11, backgroundColor: active ? 'var(--primary)' : '#e2e8f0',
            position: 'relative', transition: '0.3s'
        }}>
            <div style={{ 
                width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white',
                position: 'absolute', top: 3, left: active ? 21 : 3, transition: '0.3s'
            }}></div>
        </div>
    </div>
);

const EmptyState = ({ message }) => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-light)', gap: '1rem' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
            <FiTrendingUp size={30} />
        </div>
        <p style={{ maxWidth: '250px', fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</p>
    </div>
);

export default Reports;


