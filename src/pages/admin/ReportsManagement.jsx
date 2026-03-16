import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiPlus, FiEdit2, FiUpload, FiX, FiCheckCircle } from 'react-icons/fi';

const ReportsManagement = () => {
  const { patients, reports, createReportEntry, updateReportStatus, uploadReportFile } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const statuses = ['pending', 'in_progress', 'done'];

  const handleOpenModal = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleStatusChange = (reportId, stage, value) => {
    const updatedData = { ...editingReport, [`${stage}_status`]: value };
    // Auto set percent to 100 if done
    if (value === 'done') updatedData[`${stage}_percent`] = 100;
    else if (value === 'pending') updatedData[`${stage}_percent`] = 0;
    
    setEditingReport(updatedData);
  };

  const handlePercentChange = (reportId, stage, value) => {
    const val = parseInt(value) || 0;
    const updatedData = { ...editingReport, [`${stage}_percent`]: val };
    
    // Auto set status based on percent
    if (val === 100) updatedData[`${stage}_status`] = 'done';
    else if (val > 0) updatedData[`${stage}_status`] = 'in_progress';
    else updatedData[`${stage}_status`] = 'pending';

    setEditingReport(updatedData);
  };

  const handleSave = async () => {
    // Calculate overall progress
    const stages = ['consultation', 'record_updated', 'report_generated', 'report_published'];
    const totalPercent = stages.reduce((acc, stage) => acc + (editingReport[`${stage}_percent`] || 0), 0);
    const overall_progress = Math.round(totalPercent / 4);

    await updateReportStatus(editingReport.id, { 
        ...editingReport,
        overall_progress
    });
    setIsModalOpen(false);
  };

  const handleFileUpload = async (reportId, e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadReportFile(reportId, file);
      alert('Report uploaded successfully!');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="layout-main">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-title">Report Tracking Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            className="input-field" 
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '250px', marginBottom: 0 }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Patient</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Overall Progress</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Last Stage Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => {
              const patientReport = reports.find(r => r.patient_id === patient.id);
              return (
                <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{patient.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {patient.id}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {patientReport ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', minWidth: '100px' }}>
                          <div style={{ width: `${patientReport.overall_progress}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{patientReport.overall_progress}%</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No report entry</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {patientReport ? (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '12px', 
                        backgroundColor: patientReport.report_published_status === 'done' ? '#dcfce7' : '#fef9c3',
                        color: patientReport.report_published_status === 'done' ? '#166534' : '#854d0e',
                        textTransform: 'capitalize'
                      }}>
                        {patientReport.report_published_status.replace('_', ' ')}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {patientReport ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} title="Edit Status" onClick={() => handleOpenModal(patientReport)}>
                          <FiEdit2 size={14} />
                        </button>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="file" 
                            id={`report-upload-${patientReport.id}`} 
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(patientReport.id, e)}
                          />
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem' }} 
                            title="Upload Report File"
                            onClick={() => document.getElementById(`report-upload-${patientReport.id}`).click()}
                          >
                            <FiUpload size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-primary" onClick={() => createReportEntry(patient.id)}>
                        Initialize Report
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingReport && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Update Report Progress</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { id: 'consultation', label: 'Consultation' },
                { id: 'record_updated', label: 'Record Updated' },
                { id: 'report_generated', label: 'Report Generated' },
                { id: 'report_published', label: 'Report Published' }
              ].map(stage => (
                <div key={stage.id} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{stage.label}</div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                       <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</label>
                       <select 
                         className="input-field" 
                         value={editingReport[`${stage.id}_status`]}
                         onChange={e => handleStatusChange(editingReport.id, stage.id, e.target.value)}
                         style={{ marginBottom: 0 }}
                       >
                         {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                       </select>
                    </div>
                    <div style={{ width: '100px' }}>
                       <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Percentage</label>
                       <input 
                         type="number"
                         className="input-field"
                         min="0"
                         max="100"
                         value={editingReport[`${stage.id}_percent`]}
                         onChange={e => handlePercentChange(editingReport.id, stage.id, e.target.value)}
                         style={{ marginBottom: 0 }}
                       />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
