import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiFileText,
  FiEye,
  FiDownload,
  FiClock,
  FiSearch,
  FiChevronDown,
  FiAlertCircle,
  FiInbox,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

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
        setReports(data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Could not load reports for this patient.');
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [selectedPatient]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          <FiFileText size={26} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Patient Reports</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
            View PDF reports uploaded by your assigned patients
          </p>
        </div>
      </div>

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
        ) : patients.length === 0 ? (
          <div style={{
            padding: '1rem', backgroundColor: 'rgba(248,250,252,0.8)', borderRadius: 12,
            color: 'var(--text-secondary)', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <FiAlertCircle size={16} color="#f97316" />
            No patients with appointments found. Patients will appear here once they book an appointment with you.
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Dropdown Trigger */}
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
              <FiChevronDown size={18}
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                backgroundColor: 'white', borderRadius: 14, zIndex: 50,
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                border: '1px solid rgba(15,23,42,0.08)',
                overflow: 'hidden',
              }}>
                {/* Search */}
                <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(15,23,42,0.07)' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    backgroundColor: 'rgba(248,250,252, 0.9)', borderRadius: 10,
                    padding: '0.5rem 0.75rem',
                  }}>
                    <FiSearch size={15} color="var(--text-secondary)" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search patients…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{
                        border: 'none', outline: 'none',
                        backgroundColor: 'transparent', fontSize: '0.9rem',
                        color: 'var(--text)', flex: 1,
                      }} />
                  </div>
                </div>
                {/* List */}
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {filteredPatients.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No patients match your search.
                    </div>
                  ) : filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPatient(p); setDropdownOpen(false); setSearch(''); }}
                      style={{
                        width: '100%', padding: '0.85rem 1.25rem', textAlign: 'left',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: selectedPatient?.id === p.id ? 'rgba(82,178,191,0.08)' : 'transparent',
                        color: 'var(--text)', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (selectedPatient?.id !== p.id) e.currentTarget.style.backgroundColor = 'rgba(248,250,252,0.8)'; }}
                      onMouseLeave={e => { if (selectedPatient?.id !== p.id) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: 'rgba(82,178,191,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem',
                      }}>
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

      {/* Reports Panel */}
      {selectedPatient && (
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 20, padding: '1.5rem',
          boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
              Reports for{' '}
              <span style={{ color: 'var(--primary)' }}>{selectedPatient.name}</span>
            </h2>
            {reports.length > 0 && (
              <span style={{
                backgroundColor: 'rgba(82,178,191,0.12)', color: 'var(--primary)',
                borderRadius: 20, padding: '0.2rem 0.75rem',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                {reports.length} report{reports.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {error && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: 10,
              backgroundColor: '#fee2e2', color: '#991b1b',
              fontSize: '0.9rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <FiAlertCircle size={16} /> {error}
            </div>
          )}

          {loadingReports ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem 1rem',
              backgroundColor: 'rgba(148,163,184,0.06)', borderRadius: 14,
              color: 'var(--text-secondary)',
            }}>
              <FiInbox size={44} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No reports uploaded by this patient yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reports.map((report) => (
                <div key={report.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', borderRadius: 14,
                  backgroundColor: 'rgba(82,178,191,0.04)',
                  border: '1px solid rgba(82,178,191,0.12)',
                  gap: '1rem', flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      backgroundColor: 'rgba(82,178,191,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiFileText size={20} color="var(--primary)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {report.file_name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <FiClock size={12} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {formatDate(report.uploaded_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <a
                      href={BACKEND_URL + report.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: 10,
                        backgroundColor: 'rgba(82,178,191,0.1)', color: 'var(--primary)',
                        fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                      }}>
                      <FiEye size={15} /> View PDF
                    </a>
                    <a
                      href={BACKEND_URL + report.file_path}
                      download={report.file_name}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: 10,
                        backgroundColor: 'var(--primary)', color: 'white',
                        fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                      }}>
                      <FiDownload size={15} /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Placeholder when no patient selected */}
      {!selectedPatient && !loadingPatients && patients.length > 0 && (
        <div style={{
          backgroundColor: 'var(--white)', borderRadius: 20, padding: '3rem 1.5rem',
          boxShadow: 'var(--shadow-soft)', textAlign: 'center',
          color: 'var(--text-secondary)', border: '1px solid rgba(15,23,42,0.06)',
        }}>
          <FiFileText size={52} style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
          <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem' }}>Select a patient to view their uploaded reports.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorReport;
