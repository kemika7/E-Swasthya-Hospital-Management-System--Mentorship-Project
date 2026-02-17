import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiLoader } from 'react-icons/fi';

const PROGRESS_STEPS = [
  { id: 'consultation', label: 'Consultation', status: 'done' },
  { id: 'record', label: 'Record Updated', status: 'done' },
  { id: 'generated', label: 'Report Generated', status: 'done' },
  { id: 'published', label: 'Report Published', status: 'in_progress' },
];

const PROGRESS_PERCENT = 82;
const RADIUS = 44;
const STROKE_WIDTH = 8;
const circumference = 2 * Math.PI * RADIUS;
const strokeDashoffset = circumference - (PROGRESS_PERCENT / 100) * circumference;

const CircularProgress = () => (
  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={RADIUS * 2 + STROKE_WIDTH} height={RADIUS * 2 + STROKE_WIDTH} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={RADIUS + STROKE_WIDTH / 2}
        cy={RADIUS + STROKE_WIDTH / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(148,163,184,0.25)"
        strokeWidth={STROKE_WIDTH}
      />
      <circle
        cx={RADIUS + STROKE_WIDTH / 2}
        cy={RADIUS + STROKE_WIDTH / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
    </svg>
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{PROGRESS_PERCENT}%</span>
    </div>
  </div>
);

const Reports = () => {
  const navigate = useNavigate();
  const isReportPublished = false; // Mock: Report Published is "In Progress"

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

      {/* REPORT PROGRESS OVERVIEW SECTION */}
      <section
        style={{
          marginBottom: '1.5rem',
          backgroundColor: 'rgba(148,163,184,0.15)',
          borderRadius: 16,
          padding: '1.25rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {/* Progress Bar (Top) */}
        <div
          style={{
            width: '100%',
            height: 8,
            backgroundColor: 'rgba(148,163,184,0.25)',
            borderRadius: 999,
            marginBottom: '1.25rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${PROGRESS_PERCENT}%`,
              height: '100%',
              backgroundColor: 'var(--primary)',
              borderRadius: 999,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Progress Steps (Left) + Overall Progress (Right) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Progress Steps - Left Side */}
          <div
            style={{
              flex: 1,
              minWidth: 200,
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'space-between',
            }}
          >
            {PROGRESS_STEPS.map((step) => {
              const isDone = step.status === 'done';
              return (
                <div
                  key={step.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: isDone ? 'var(--primary)' : 'rgba(148,163,184,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isDone ? (
                      <FiCheck size={18} style={{ color: 'var(--white)' }} />
                    ) : (
                      <FiLoader size={18} style={{ color: 'rgba(23,23,16,0.6)' }} />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: isDone ? 'var(--text)' : 'rgba(23,23,16,0.6)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {step.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: isDone ? 'var(--primary)' : 'rgba(23,23,16,0.5)',
                      fontWeight: 500,
                    }}
                  >
                    {isDone ? 'Done' : 'In Progress'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Overall Progress - Right Side */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              flexShrink: 0,
            }}
          >
            <CircularProgress />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              Overall Progress
            </span>
          </div>
        </div>
      </section>

      {/* REPORT ACCESS SECTION */}
      <section
        style={{
          backgroundColor: 'rgba(148,163,184,0.15)',
          borderRadius: 16,
          padding: '1.25rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            opacity: 0.9,
          }}
        >
          After the Report Publishing is Complete, You can click here to view your report.
        </p>
        <button
          type="button"
          disabled={!isReportPublished}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 12,
            border: '2px solid var(--primary)',
            backgroundColor: 'var(--white)',
            color: 'var(--primary)',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: isReportPublished ? 'pointer' : 'not-allowed',
            opacity: isReportPublished ? 1 : 0.6,
          }}
        >
          View Your Report
        </button>
      </section>
    </main>
  );
};

export default Reports;
