import React, { useMemo, useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiCheck, FiX, FiEye } from 'react-icons/fi';

const DoctorAppointments = () => {
  const { appointments } = useAdmin();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const doctorName = userProfile?.name || '';

  const myAppointments = useMemo(() => {
    return (appointments || []).filter(a => a.doctorName === doctorName);
  }, [appointments, doctorName]);

  return (
    <div className="layout-main">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Appointments</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Manage and view all your scheduled appointments
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading appointments...
          </div>
        ) : myAppointments.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No appointments scheduled
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Patient</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Time</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {myAppointments.map(app => (
                  <tr key={app.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{app.patientName}</td>
                    <td style={{ padding: '0.75rem' }}>{app.date}</td>
                    <td style={{ padding: '0.75rem' }}>{app.time}</td>
                    <td style={{ padding: '0.75rem' }}>{app.type}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        color: app.status === 'Completed' ? '#22c55e' : app.status === 'Cancelled' ? '#ef4444' : '#3b82f6',
                        fontWeight: 500,
                        backgroundColor: `${app.status === 'Completed' ? '#22c55e' : app.status === 'Cancelled' ? '#ef4444' : '#3b82f6'}15`,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem' }}>
                        <FiEye size={14} />
                        <span style={{ marginLeft: '0.35rem' }}>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
