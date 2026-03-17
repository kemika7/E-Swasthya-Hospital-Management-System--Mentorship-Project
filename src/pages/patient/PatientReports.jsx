import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUploadCloud,
  FiFileText,
  FiDownload,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiX,
} from 'react-icons/fi';

// Derive the server root (no /api) from the env variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
// BACKEND_URL is used for constructing file view/download links (no /api suffix)
const BACKEND_URL = API_BASE.replace(/\/api$/, '');

const PatientReports = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch patient's uploaded reports on mount
  const fetchReports = async () => {
    try {
      const { apiFetch } = await import('../../services/apiClient');
      const data = await apiFetch('/reports/my-patient-reports');
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    
    // Safari sometimes sends empty type or quirky type for PDFs
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return 'Only PDF files are allowed.';
    
    if (file.size > 20 * 1024 * 1024) return 'File size must be under 20 MB.';
    return null;
  };

  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) {
      showToast('error', error);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    const error = validateFile(selectedFile);
    if (error) { showToast('error', error); return; }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('report', selectedFile);

      const res = await fetch(`${API_BASE}/reports/upload-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      showToast('success', 'Report uploaded successfully!');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchReports();
    } catch (err) {
      showToast('error', err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.5rem', borderRadius: 14,
          backgroundColor: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#166534' : '#991b1b',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
          fontWeight: 600, fontSize: '0.9rem',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.type === 'success'
            ? <FiCheckCircle size={18} />
            : <FiAlertCircle size={18} />}
          {toast.message}
          <button onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem', padding: 0 }}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{
        backgroundColor: 'var(--primary)', borderRadius: 20, padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'white',
        boxShadow: '0 10px 25px -5px rgba(82,178,191,0.35)',
      }}>
        <button onClick={() => navigate('/patient/dashboard')} style={{
          width: 44, height: 44, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)', color: 'white',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <FiArrowLeft size={22} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>My Reports</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Upload and manage your medical PDF reports</p>
        </div>
      </div>

      {/* Upload Section */}
      <div style={{
        backgroundColor: 'var(--white)', borderRadius: 20, padding: '2rem',
        boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.06)',
      }}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
          Upload New Report
        </h2>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : selectedFile ? '#10b981' : '#cbd5e1'}`,
            borderRadius: 16, padding: '2.5rem 1.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            backgroundColor: dragOver ? 'rgba(82,178,191,0.05)' : selectedFile ? 'rgba(16,185,129,0.04)' : 'rgba(248,250,252,0.8)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            backgroundColor: selectedFile ? 'rgba(16,185,129,0.1)' : 'rgba(82,178,191,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {selectedFile
              ? <FiFileText size={32} color="#10b981" />
              : <FiUploadCloud size={32} color="var(--primary)" />}
          </div>

          {selectedFile ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
                {selectedFile.name}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: '1rem' }}>
                Drag & drop your PDF here
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse</span> to select — PDF only, max 20 MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        {/* Upload Button */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          {selectedFile && (
            <button
              onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: 12,
                backgroundColor: '#f1f5f9', color: '#475569',
                border: 'none', fontWeight: 600, cursor: 'pointer',
              }}>
              Clear
            </button>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{
              padding: '0.75rem 2rem', borderRadius: 12,
              backgroundColor: selectedFile ? 'var(--primary)' : '#e2e8f0',
              color: selectedFile ? 'white' : '#94a3b8',
              border: 'none', fontWeight: 700, cursor: selectedFile ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s', opacity: uploading ? 0.7 : 1,
            }}>
            <FiUploadCloud size={18} />
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div style={{
        backgroundColor: 'var(--white)', borderRadius: 20, padding: '2rem',
        boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(15,23,42,0.06)',
      }}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
          Uploaded Reports
          {reports.length > 0 && (
            <span style={{
              marginLeft: '0.75rem', backgroundColor: 'rgba(82,178,191,0.12)',
              color: 'var(--primary)', borderRadius: 20, padding: '0.2rem 0.7rem',
              fontSize: '0.8rem', fontWeight: 700,
            }}>{reports.length}</span>
          )}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(148,163,184,0.06)', borderRadius: 14,
          }}>
            <FiFileText size={48} style={{ opacity: 0.3, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No reports uploaded yet.</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Upload a PDF report using the form above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reports.map((report) => (
              <div key={report.id} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
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
                      margin: 0, fontWeight: 600, color: 'var(--text)',
                      fontSize: '0.95rem', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
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
                      transition: 'background 0.2s',
                    }}>
                    <FiEye size={15} /> View
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

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </main>
  );
};

export default PatientReports;
