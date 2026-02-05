import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const AppointmentsManagement = () => {
  const { appointments, updateAppointment, deleteAppointment } = useAdmin();

  const handleStatusChange = (id, newStatus) => {
    updateAppointment(id, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return '#22c55e';
      case 'scheduled': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="layout-main">
      <div className="page-header">
        <h2 className="page-title">Appointment Management</h2>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Patient</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Doctor</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date & Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>{app.patientName}</td>
                <td style={{ padding: '1rem' }}>{app.doctorName}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>{app.date}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.time}</div>
                </td>
                <td style={{ padding: '1rem' }}>{app.type}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    color: getStatusColor(app.status), 
                    fontWeight: 500,
                    backgroundColor: `${getStatusColor(app.status)}15`,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {app.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {app.status !== 'Completed' && (
                      <button 
                        className="btn btn-outline" 
                        title="Mark Completed"
                        style={{ color: '#22c55e', borderColor: '#22c55e', padding: '0.4rem' }} 
                        onClick={() => handleStatusChange(app.id, 'Completed')}
                      >
                        <FiCheck size={14} />
                      </button>
                    )}
                    {app.status !== 'Cancelled' && (
                      <button 
                        className="btn btn-outline" 
                        title="Cancel"
                        style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.4rem' }} 
                        onClick={() => handleStatusChange(app.id, 'Cancelled')}
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsManagement;
