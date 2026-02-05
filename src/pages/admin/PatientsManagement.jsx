import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const PatientsManagement = () => {
  const { patients, addPatient, updatePatient, deletePatient } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', condition: '', lastVisit: '' });

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData(patient);
    } else {
      setEditingPatient(null);
      setFormData({ name: '', age: '', condition: '', lastVisit: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatient(editingPatient.id, formData);
    } else {
      addPatient(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="layout-main">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-title">Patient Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Add Patient
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Age</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Condition</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Last Visit</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>{patient.name}</td>
                <td style={{ padding: '1rem' }}>{patient.age}</td>
                <td style={{ padding: '1rem' }}>{patient.condition}</td>
                <td style={{ padding: '1rem' }}>{patient.lastVisit}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => handleOpenModal(patient)}>
                      <FiEdit2 size={14} />
                    </button>
                    <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.4rem' }} onClick={() => deletePatient(patient.id)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                className="input-field" 
                placeholder="Patient Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <input 
                className="input-field" 
                placeholder="Age" 
                type="number"
                value={formData.age} 
                onChange={e => setFormData({...formData, age: e.target.value})} 
                required 
              />
              <input 
                className="input-field" 
                placeholder="Condition" 
                value={formData.condition} 
                onChange={e => setFormData({...formData, condition: e.target.value})} 
                required 
              />
              <input 
                className="input-field" 
                placeholder="Last Visit" 
                type="date"
                value={formData.lastVisit} 
                onChange={e => setFormData({...formData, lastVisit: e.target.value})} 
                required 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingPatient ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManagement;
