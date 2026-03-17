import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const ErrorDisplay = ({ message, onRetry, style = {} }) => {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#fffafb',
      borderRadius: 16,
      border: '1px solid #fee2e2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '1rem',
      ...style
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: '#fee2e2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444'
      }}>
        <FiAlertTriangle size={24} />
      </div>
      
      <div style={{ gap: '0.25rem', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontWeight: 600, color: '#991b1b', margin: 0 }}>
          Oops! Something went wrong
        </p>
        <p style={{ fontSize: '0.85rem', color: '#b91c1c', opacity: 0.8, margin: 0 }}>
          {message || 'Failed to load data.'}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1.25rem',
            borderRadius: 8,
            backgroundColor: 'var(--primary)',
            color: 'var(--white)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 6px rgba(82, 178, 191, 0.2)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(82, 178, 191, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(82, 178, 191, 0.2)';
          }}
        >
          <FiRefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
