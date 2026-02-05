import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { useAdmin } from '../../context/AdminContext';
import { adminAnalyticsData } from '../../data/mockData';
import adminDashboardImage from '../../assets/images/admin-dashboard.png';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminDashboard = () => {
  const { kpis, announcements, addAnnouncement, deleteAnnouncement, beds, updateBedCapacity, doctors, appointments, updateAppointment, patients, updatePatient } = useAdmin();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [analyticsFilter, setAnalyticsFilter] = useState('all');

  // Announcement State
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' });
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);

  // Top Performing Doctors Logic
  const topDoctors = doctors
    .map(doc => ({
      ...doc,
      score: (doc.rating * 20) + (Math.random() * 20) // Mock score calculation
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const handleAppointmentAction = (id, action) => {
    if (action === 'cancel') {
      updateAppointment(id, { status: 'Cancelled' });
    } else if (action === 'reschedule') {
      // For inline demo, just alerting. Real app would open modal.
      const newDate = prompt("Enter new date (YYYY-MM-DD):");
      if (newDate) updateAppointment(id, { date: newDate, status: 'Rescheduled' });
    }
  };

  const handlePatientUpdate = (id, field, value) => {
    updatePatient(id, { [field]: value });
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: adminAnalyticsData.labels,
        datasets: [
          {
            label: 'Patients',
            data: adminAnalyticsData.patientCounts.map(c => analyticsFilter === 'all' ? c : c * 0.5), // Mock filter effect
            backgroundColor: '#52B2BF',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [analyticsFilter]);

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (newAnnouncement.title && newAnnouncement.body) {
      addAnnouncement(newAnnouncement);
      setNewAnnouncement({ title: '', body: '' });
      setIsAddingAnnouncement(false);
    }
  };

  return (
    <div className="layout-main">
      <div className="page-header">
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Operational overview of hospital performance for administrators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: '1.25rem', gap: '1rem' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/patients')}>
          <Card title="Total Patients">
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{kpis.totalPatients}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Click to manage
            </div>
          </Card>
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/doctors')}>
          <Card title="Doctors">
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{kpis.totalDoctors}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Click to manage
            </div>
          </Card>
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/appointments')}>
          <Card title="Appointments">
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {kpis.totalAppointmentsToday}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Today's Schedule
            </div>
          </Card>
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/transactions')}>
          <Card title="Transactions">
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {kpis.totalTransactions}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              ${kpis.totalRevenue} Revenue
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
        <Card title="Patient Mix by Service Line">
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
             <select 
               value={analyticsFilter} 
               onChange={(e) => setAnalyticsFilter(e.target.value)}
               style={{ padding: '0.2rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
             >
               <option value="all">All Time</option>
               <option value="month">This Month</option>
               <option value="week">This Week</option>
             </select>
          </div>
          <canvas ref={chartRef} height={200} />
        </Card>

        <Card title="Bed Availability (Editable)">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {Object.entries(beds).map(([type, data]) => (
               <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                 <div>
                   <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{type} Ward</div>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.occupied} / {data.total} Occupied</div>
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                   <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '1.2rem' }}
                    onClick={() => updateBedCapacity(type, { occupied: Math.max(0, data.occupied - 1) })}
                   >-</button>
                   <span style={{ fontSize: '0.9rem' }}>Occupied</span>
                   <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '1.2rem' }}
                    onClick={() => updateBedCapacity(type, { occupied: Math.min(data.total, data.occupied + 1) })}
                   >+</button>
                 </div>
               </div>
             ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
        <Card title="Top Performing Doctors">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
             {topDoctors.map((doc, index) => (
               <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.8rem', borderBottom: index < topDoctors.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{doc.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.specialty}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#22c55e' }}>{doc.rating.toFixed(1)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rating</div>
                  </div>
               </div>
             ))}
           </div>
        </Card>

        <Card title="Recent Appointments">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
             {appointments.slice(0, 3).map((app) => (
               <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                 <div>
                   <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{app.patientName}</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.doctorName} • {app.time}</div>
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {app.status === 'Pending' || app.status === 'Scheduled' ? (
                     <>
                       <button onClick={() => handleAppointmentAction(app.id, 'reschedule')} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Reschedule</button>
                       <button onClick={() => handleAppointmentAction(app.id, 'cancel')} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }}>Cancel</button>
                     </>
                   ) : (
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.2rem 0.5rem' }}>{app.status}</span>
                   )}
                 </div>
               </div>
             ))}
             <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
               <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }} onClick={() => navigate('/admin/appointments')}>View All Appointments</span>
             </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
        <Card title="Recently Admitted Patients">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
             {patients.filter(p => p.status === 'Admitted').slice(0, 3).map((patient) => (
               <div key={patient.id} style={{ padding: '0.6rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <span style={{ fontWeight: 600 }}>{patient.name}</span>
                   <button 
                     onClick={() => handlePatientUpdate(patient.id, 'status', 'Discharged')}
                     className="btn btn-outline"
                     style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }}
                   >
                     Discharge
                   </button>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                   <div>
                     <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Room</label>
                     <input 
                       type="text" 
                       value={patient.room || ''}
                       onChange={(e) => handlePatientUpdate(patient.id, 'room', e.target.value)}
                       style={{ width: '100%', padding: '0.2rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                     />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Ward</label>
                     <select 
                       value={patient.ward || 'General'}
                       onChange={(e) => handlePatientUpdate(patient.id, 'ward', e.target.value)}
                       style={{ width: '100%', padding: '0.2rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                     >
                       <option value="General">General</option>
                       <option value="Private">Private</option>
                       <option value="ICU">ICU</option>
                     </select>
                   </div>
                 </div>
               </div>
             ))}
             {patients.filter(p => p.status === 'Admitted').length === 0 && (
               <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No admitted patients.</div>
             )}
           </div>
        </Card>

        <Card title="Announcements">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span>Latest Updates</span>
            <button className="btn btn-outline" onClick={() => setIsAddingAnnouncement(!isAddingAnnouncement)}>
              {isAddingAnnouncement ? 'Cancel' : 'New Announcement'}
            </button>
          </div>

          {isAddingAnnouncement && (
            <form onSubmit={handleAddAnnouncement} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <input 
                className="input-field" 
                placeholder="Title" 
                value={newAnnouncement.title} 
                onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} 
                style={{ marginBottom: '0.5rem' }}
                required
              />
              <textarea 
                className="input-field" 
                placeholder="Content" 
                value={newAnnouncement.body} 
                onChange={e => setNewAnnouncement({...newAnnouncement, body: e.target.value})} 
                rows={3}
                style={{ marginBottom: '0.5rem' }}
                required
              />
              <button type="submit" className="btn btn-primary">Post Announcement</button>
            </form>
          )}

          <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.9rem' }}>
            {announcements.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: 12,
                  backgroundColor: 'rgba(248,250,252,0.96)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.15rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '0.2rem' }}>
                    {item.body}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.date}</div>
                </div>
                <button 
                  onClick={() => deleteAnnouncement(item.id)}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

