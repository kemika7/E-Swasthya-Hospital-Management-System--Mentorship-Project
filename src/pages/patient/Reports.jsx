import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiLoader, FiFileText } from 'react-icons/fi';
import { apiFetch } from '../../services/apiClient';

const AnimatedCircularProgress = ({ percent, size = 60, strokeWidth = 5, label, status }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = circumference - (percent / 100) * circumference;
    setOffset(progressOffset);
  }, [percent, circumference]);

  const getColor = () => {
    if (status === 'done') return '#22c55e'; // Green
    if (status === 'in_progress') return '#3b82f6'; // Blue
    return '#94a3b8'; // Grey (Pending)
  };

  const color = getColor();

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ 
                strokeDashoffset: offset,
                transition: 'stroke-dashoffset 1s ease-in-out',
                strokeLinecap: 'round'
            }}
          />
        </svg>
        <div style={{ 
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size > 80 ? '1.25rem' : '0.75rem', fontWeight: 700, color: 'var(--text)'
        }}>
          {percent}%
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: '0.7rem', color, fontWeight: 500, textTransform: 'capitalize' }}>
            {status.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportStatus = async () => {
      try {
        const data = await apiFetch('/reports/my-report');
        setReportData(data);
      } catch (err) {
        console.error('Failed to fetch report status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportStatus();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <FiLoader className="spin" size={32} />
      </div>
    );
  }

  const steps = [
    { id: 'consultation', label: 'Consultation' },
    { id: 'record_updated', label: 'Record Updated' },
    { id: 'report_generated', label: 'Report Generated' },
    { id: 'report_published', label: 'Report Published' },
  ];

  const overallPercent = reportData?.overall_progress || 0;
  const isReportPublished = reportData?.report_published_status === 'done' && reportData?.report_file_path;

  const handleViewReport = () => {
    if (reportData?.report_file_path) {
      window.open(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${reportData.report_file_path}`, '_blank');
    }
  };

  return (
    <main
      className="layout-main"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        paddingBottom: '2rem',
      }}
    >
      {/* TOP HEADER BAR */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: 16,
          padding: '0.9rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/patient/dashboard')}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft size={20} style={{ color: 'var(--white)' }} />
        </button>

        <div
          style={{
            flex: 1,
            textAlign: 'center',
            color: 'var(--white)',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          Report Tracking
        </div>

        <div style={{ width: 40 }} />
      </div>

      {/* OVERALL PROGRESS SECTION */}
      <section
        style={{
          marginBottom: '1.5rem',
          backgroundColor: 'var(--white)',
          borderRadius: 20,
          padding: '2rem',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}
      >
        <AnimatedCircularProgress 
            percent={overallPercent} 
            size={120} 
            strokeWidth={10} 
            label="Overall Progress" 
            status={overallPercent === 100 ? 'done' : 'in_progress'} 
        />
      </section>

      {/* INDIVIDUAL STEPS PROGRESS */}
      <section
        style={{
          marginBottom: '1.5rem',
          backgroundColor: 'var(--white)',
          borderRadius: 20,
          padding: '1.5rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Process Timeline</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.5rem',
            justifyItems: 'center'
          }}
        >
          {steps.map((step) => (
            <AnimatedCircularProgress
              key={step.id}
              percent={reportData ? reportData[`${step.id}_percent`] : 0}
              status={reportData ? reportData[`${step.id}_status`] : 'pending'}
              label={step.label}
              size={80}
              strokeWidth={6}
            />
          ))}
        </div>
      </section>

      {/* REPORT ACCESS SECTION */}
      <section
        style={{
          backgroundColor: isReportPublished ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
          borderRadius: 20,
          padding: '2rem',
          boxShadow: 'var(--shadow-soft)',
          textAlign: 'center',
          border: isReportPublished ? '1px solid rgba(34,197,94,0.2)' : 'none'
        }}
      >
        {isReportPublished ? (
          <>
            <div style={{ 
                width: 60, height: 60, borderRadius: '50%', backgroundColor: '#22c55e', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 1rem', color: 'var(--white)' 
            }}>
              <FiCheck size={30} />
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.5rem' }}>
              Your report is ready to view!
            </p>
            <button
              type="button"
              onClick={handleViewReport}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: 14,
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'var(--white)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '0 auto'
              }}
            >
              <FiFileText size={20} />
              View Your Report
            </button>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text)',
                lineHeight: 1.6,
                marginBottom: '1rem',
                opacity: 0.8,
              }}
            >
              Once the Report Publishing is Complete, you will be able to view and download your report here.
            </p>
            <button
              type="button"
              disabled
              style={{
                padding: '0.9rem 2rem',
                borderRadius: 14,
                border: '2px dashed var(--text-light)',
                backgroundColor: 'transparent',
                color: 'var(--text-light)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'not-allowed',
                opacity: 0.6,
              }}
            >
              Report Pending
            </button>
          </>
        )}
      </section>
    </main>
  );
};

export default Reports;
