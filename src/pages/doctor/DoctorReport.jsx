import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiFileText,
  FiEye,
  FiClock,
  FiSearch,
  FiChevronDown,
  FiAlertCircle,
  FiInbox,
  FiCpu,
  FiX,
  FiCheckCircle,
  FiTrendingUp,
  FiActivity,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/api$/, '');

const DoctorReport = () => {
  const { userProfile } = useAuth();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Fetch the doctor's assigned patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const data = await apiFetch('/reports/my-patients');
        setPatients(data);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        setError('Could not load your patients. Please try again.');
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  // Fetch reports when a patient is selected
  useEffect(() => {
    if (!selectedPatient) {
      setReports([]);
      return;
    }
    const fetchReports = async () => {
      setLoadingReports(true);
      setError('');
      try {
        const { apiFetch } = await import('../../services/apiClient');
        const data = await apiFetch(`/reports/patient-reports/${selectedPatient.id}`);
        
        // Robust parsing of JSON columns from database
        const processed = data.map(r => {
          const tryParse = (val) => {
            if (!val) return null;
            if (typeof val === 'object') return val;
            try {
              return JSON.parse(val);
            } catch (e) {
              console.warn('Failed to parse JSON column:', e, val);
              return null;
            }
          };

          return {
            ...r,
            gpt_analysis: tryParse(r.gpt_analysis),
            extracted_data: tryParse(r.extracted_data),
            chart_data: tryParse(r.chart_data),
          };
        });

        console.log('Processed reports for patient:', selectedPatient.id, processed);
        setReports(processed);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Could not load reports for this patient.');
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [selectedPatient]);

  const handleAnalyze = async (reportId) => {
    setAnalyzingId(reportId);
    setError('');
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const response = await apiFetch('/reports/analyze-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      });
      
      const newAnalysis = response.analysis;
      setAnalysisResult(newAnalysis);
      setShowAnalysisModal(true);
      
      // Update the report in the list with the new analysis
      setReports(prev => prev.map(r => r.id === reportId ? {
        ...r,
        gpt_analysis: newAnalysis,
        extracted_data: newAnalysis.extracted_data,
        chart_data: newAnalysis.chart_data
      } : r));

    } catch (err) {
      console.error('Analysis failed:', err);
      setError('AI Analysis failed. Please try again.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const openAnalysis = (report) => {
    setAnalysisResult(report.gpt_analysis);
    setShowAnalysisModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--primary)', borderRadius: 20,
        padding: '1.5rem', color: 'white',
        boxShadow: '0 10px 25px -5px rgba(82,178,191,0.35)',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiActivity size={26} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Medical Diagnostics Lab</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
            Intelligent Health Analysis & Trend Visualizations
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Patient Selector */}
          <div style={{
            backgroundColor: 'var(--white)', borderRadius: 20, padding: '1.5rem',
            boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.06)',
          }}>
            <label style={{
              display: 'block', fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Select Patient
            </label>

            {loadingPatients ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading patients…</div>
            ) : (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    width: '100%', padding: '0.9rem 1.25rem',
                    borderRadius: 12, border: '1px solid rgba(15,23,42,0.12)',
                    backgroundColor: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: '0.95rem', color: selectedPatient ? 'var(--text)' : 'var(--text-secondary)',
                    fontWeight: selectedPatient ? 600 : 400,
                  }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FiUser size={16} color="var(--primary)" />
                    {selectedPatient ? selectedPatient.name : 'Choose a patient…'}
                  </span>
                  <FiChevronDown size={18} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    backgroundColor: 'white', borderRadius: 14, zIndex: 50,
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(15,23,42,0.08)', overflow: 'hidden',
                  }}>
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(15,23,42,0.07)' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: 'rgba(248,250,252, 0.9)', borderRadius: 10, padding: '0.5rem 0.75rem',
                      }}>
                        <FiSearch size={15} color="var(--text-secondary)" />
                        <input
                          autoFocus type="text" placeholder="Search patients…"
                          value={search} onChange={e => setSearch(e.target.value)}
                          style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.9rem', flex: 1 }} />
                      </div>
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {filteredPatients.map(p => (
                        <button key={p.id} onClick={() => { setSelectedPatient(p); setDropdownOpen(false); setSearch(''); }}
                          style={{
                            width: '100%', padding: '0.85rem 1.25rem', textAlign: 'left', border: 'none', cursor: 'pointer',
                            backgroundColor: selectedPatient?.id === p.id ? 'rgba(82,178,191,0.08)' : 'transparent',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                          }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(82,178,191,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            {p.email && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.email}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report List */}
          {selectedPatient && (
            <div style={{
              backgroundColor: 'var(--white)', borderRadius: 20, padding: '1.5rem',
              boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.06)',
            }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>Reports History</h2>
              {loadingReports ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>Loading…</div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No reports found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.map((report) => (
                    <div key={report.id} style={{
                      padding: '1rem', borderRadius: 14, backgroundColor: 'rgba(82,178,191,0.04)',
                      border: '1px solid rgba(82,178,191,0.12)', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FiFileText size={20} color="var(--primary)" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {report.file_name}
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(report.uploaded_at)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {report.gpt_analysis ? (
                          <button onClick={() => openAnalysis(report)} style={{
                            flex: 1, padding: '0.5rem', borderRadius: 8, backgroundColor: 'rgba(34,197,94,0.1)',
                            color: '#16a34a', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                          }}>
                            <FiCheckCircle size={14} /> View AI Analysis
                          </button>
                        ) : (
                          <button onClick={() => handleAnalyze(report.id)} disabled={analyzingId === report.id} style={{
                            flex: 1, padding: '0.5rem', borderRadius: 8, backgroundColor: analyzingId === report.id ? 'rgba(148,163,184,0.1)' : 'var(--primary)',
                            color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                          }}>
                            <FiCpu size={14} className={analyzingId === report.id ? 'spin' : ''} />
                            {analyzingId === report.id ? 'Analyzing…' : 'Run AI Analysis'}
                          </button>
                        )}
                        <a href={BACKEND_URL + report.file_path} target="_blank" rel="noopener noreferrer" style={{
                          padding: '0.5rem', borderRadius: 8, backgroundColor: 'rgba(82,178,191,0.1)',
                          color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FiEye size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard / Analytics Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!selectedPatient ? (
            <div style={{ height: '100%', backgroundColor: 'var(--white)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', border: '1px dashed rgba(15,23,42,0.1)' }}>
              <FiUser size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', margin: 0 }}>Select a patient to begin diagnostics</h3>
            </div>
          ) : reports.length === 0 ? (
            <div style={{ height: '100%', backgroundColor: 'var(--white)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', border: '1px dashed rgba(15,23,42,0.1)' }}>
              <FiInbox size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', margin: 0 }}>No reports available for this patient</h3>
            </div>
          ) : (
            <>
              {/* Trends & Visualization Summary */}
              <div style={{
                backgroundColor: 'var(--white)', borderRadius: 20, padding: '1.5rem',
                boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: 10, backgroundColor: 'rgba(82,178,191,0.1)', color: 'var(--primary)' }}>
                    <FiTrendingUp size={20} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Diagnostics Visualization</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {/* Latest Analysis Chart */}
                  {(() => {
                    const latestWithChart = [...reports]
                      .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
                      .find(r => r.chart_data && r.chart_data.labels && r.chart_data.labels.length > 0);
                    
                    if (latestWithChart) {
                      return (
                        <div style={{ backgroundColor: 'rgba(248,250,252,0.6)', borderRadius: 16, padding: '1rem', border: '1px solid rgba(15,23,42,0.04)' }}>
                          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Trend from report: {latestWithChart.file_name}</p>
                          <div style={{ height: 250 }}>
                            {latestWithChart.chart_data?.chart_type === 'bar' ? (
                              <Bar 
                                data={latestWithChart.chart_data}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: { legend: { display: true, position: 'bottom' } },
                                  scales: { y: { beginAtZero: true } }
                                }} 
                              />
                            ) : (
                              <Line 
                                data={latestWithChart.chart_data}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: { legend: { display: true, position: 'bottom' } },
                                  scales: { y: { beginAtZero: false } }
                                }} 
                              />
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div style={{ backgroundColor: 'rgba(248,250,252,0.6)', borderRadius: 16, padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed rgba(15,23,42,0.08)' }}>
                        No chart data available yet. Run AI Analysis on a report to extract visualization data.
                      </div>
                    );
                  })()}

                  {/* Lab Results Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Extracted Lab Values</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      {(() => {
                        const allLabs = reports.reduce((acc, r) => ({ ...acc, ...(r.extracted_data || {}) }), {});
                        const entries = Object.entries(allLabs);
                        if (entries.length === 0) return <div style={{ fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.6 }}>No data extracted yet.</div>;
                        return entries.map(([key, val]) => (
                          <div key={key} style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: 12, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{key}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{String(val)}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#fff7ed', borderRadius: 20, padding: '1.5rem', border: '1px solid #fed7aa' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <FiAlertCircle size={16} /> Latest Health Risks
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(() => {
                      const latestWithRisks = [...reports]
                        .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
                        .find(r => r.gpt_analysis?.risks?.length > 0);
                      
                      if (!latestWithRisks) return <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>No high-risk conditions flagged.</div>;
                      
                      return latestWithRisks.gpt_analysis.risks.map((risk, idx) => (
                        <div key={idx} style={{ 
                          padding: '0.75rem', backgroundColor: risk.severity === 'High' ? '#fee2e2' : 'rgba(255,255,255,0.6)', 
                          borderRadius: 12, border: risk.severity === 'High' ? '1px solid #ef4444' : '1px solid rgba(251,146,60,0.2)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{risk.condition}</span>
                            <span style={{ 
                              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, 
                              backgroundColor: risk.severity === 'High' ? '#ef4444' : '#fb923c', color: 'white', fontWeight: 700
                            }}>{risk.severity}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#7c2d12', opacity: 0.9 }}>{risk.recommendation}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', borderRadius: 20, padding: '1.5rem', border: '1px solid #bbf7d0' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <FiActivity size={16} /> Abnormality Analysis
                  </h3>
                  {(() => {
                    const latestWithPie = [...reports]
                      .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
                      .find(r => r.gpt_analysis?.abnormality_pie);
                    
                    if (!latestWithPie) return <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Analyze a report to see test distribution.</div>;
                    
                    return (
                      <div style={{ height: 180, position: 'relative' }}>
                        <Pie 
                          data={{
                            labels: ['Normal', 'Abnormal'],
                            datasets: [{
                              data: latestWithPie.gpt_analysis.abnormality_pie.values,
                              backgroundColor: ['#22c55e', '#ef4444'],
                              borderWidth: 0
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'right' } }
                          }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Analysis Result Modal */}
      {showAnalysisModal && analysisResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: 24, width: '100%', maxWidth: 800,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                  <FiCpu size={20} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>AI Analysis Summary</h2>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} style={{ border: 'none', backgroundColor: 'rgba(15,23,42,0.05)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={18} />
              </button>
            </div>

            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>Clinical Summary</h3>
                <div style={{ padding: '1.25rem', backgroundColor: 'rgba(82,178,191,0.05)', borderRadius: 16, border: '1px solid rgba(82,178,191,0.1)', lineHeight: 1.6 }}>
                  {analysisResult.summary}
                </div>
              </section>

              {/* Show Comparison (New) or Trends (Old) */}
              {(analysisResult.comparison || analysisResult.trends) && (
                <section>
                  <h3 style={{ fontSize: '0.9rem', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>
                    {analysisResult.comparison ? 'Report Comparison' : 'Trend Analysis'}
                  </h3>
                  <div style={{ padding: '1.25rem', backgroundColor: 'rgba(139,92,246,0.05)', borderRadius: 16, border: '1px solid rgba(139,92,246,0.1)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {analysisResult.comparison || analysisResult.trends}
                  </div>
                </section>
              )}

              {/* Legacy Sections: Only show if data exists (for historical reports) */}
              {analysisResult.lab_interpretation?.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>Lab Test Interpretation</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analysisResult.lab_interpretation.map((lab, idx) => (
                      <div key={idx} style={{ padding: '0.85rem', borderRadius: 12, backgroundColor: lab.status !== 'Normal' ? '#fee2e2' : 'rgba(15,23,42,0.03)', border: lab.status !== 'Normal' ? '1px solid #f87171' : '1px solid rgba(15,23,42,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{lab.parameter}: {lab.value}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: lab.status !== 'Normal' ? '#dc2626' : '#16a34a' }}>{lab.status}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>{lab.insight}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {analysisResult.medications?.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>Medication & Prescription Summary</h3>
                  <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(15,23,42,0.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ backgroundColor: 'rgba(15,23,42,0.02)' }}>
                        <tr>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>Drug</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>Dose</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>Duration</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.medications.map((med, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(15,23,42,0.04)', fontWeight: 600 }}>{med.name}</td>
                            <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{med.dose}</td>
                            <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{med.duration}</td>
                            <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(15,23,42,0.04)', fontSize: '0.8rem', opacity: 0.8 }}>{med.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {analysisResult.actionable_insights?.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '0.9rem', color: '#166534', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>Actionable Insights</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {analysisResult.actionable_insights.map((insight, idx) => (
                      <div key={idx} style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <FiCheckCircle size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', color: '#14532d' }}>{insight}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(15,23,42,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAnalysisModal(false)} style={{ padding: '0.75rem 2rem', borderRadius: 12, backgroundColor: 'var(--text)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default DoctorReport;
