import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--white)',
          borderRadius: 24,
          margin: '2rem auto',
          maxWidth: 500,
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <FiAlertCircle size={32} />
          </div>
          
          <div style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Something went wrong
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: 12,
                backgroundColor: 'var(--primary)',
                color: 'var(--white)',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(82, 178, 191, 0.25)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FiRefreshCw size={18} /> Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 12,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
            If the issue persists, please contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
