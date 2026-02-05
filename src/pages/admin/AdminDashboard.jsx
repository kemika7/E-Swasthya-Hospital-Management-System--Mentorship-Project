import React, { useEffect, useRef } from 'react';
import Card from '../../components/Card';
import { adminKpis, adminAnnouncements, adminAnalyticsData } from '../../data/mockData';
import adminDashboardImage from '../../assets/images/admin-dashboard.png';
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
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

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
            data: adminAnalyticsData.patientCounts,
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
  }, []);

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

      <div className="grid grid-cols-3" style={{ marginBottom: '1.25rem' }}>
        <Card title="Total Patients">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{adminKpis.totalPatients}</div>
        </Card>
        <Card title="Doctors">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{adminKpis.totalDoctors}</div>
        </Card>
        <Card title="Appointments Today">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {adminKpis.totalAppointmentsToday}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2">
        <Card title="Patient Mix by Service Line">
          <canvas ref={chartRef} height={200} />
        </Card>

        <Card title="Announcements">
          <div style={{ marginBottom: '0.75rem' }}>
            <img
              src={adminDashboardImage}
              alt="Admin dashboard illustration"
              style={{ borderRadius: 16, marginBottom: '0.75rem' }}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.9rem' }}>
            {adminAnnouncements.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: 12,
                  backgroundColor: 'rgba(248,250,252,0.96)',
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: '0.15rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '0.2rem' }}>
                  {item.body}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

