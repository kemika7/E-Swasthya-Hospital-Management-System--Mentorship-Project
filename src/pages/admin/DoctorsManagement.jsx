import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

const DoctorsManagement = () => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({ name: '', specialty: '', experience: '', nextAvailable: '' });

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData(doctor);
    } else {
      setEditingDoctor(null);
      setFormData({ name: '', specialty: '', experience: '', nextAvailable: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDoctor) {
      updateDoctor(editingDoctor.id, formData);
    } else {
      addDoctor(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="layout-main">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-title">Doctor Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Add Doctor
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {doctors.map(doctor => (
          <div key={doctor.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{doctor.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doctor.specialty}</p>
              </div>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                borderRadius: '999px', 
                backgroundColor: 'rgba(82,178,191,0.1)', 
                color: 'var(--primary)',
                fontSize: '0.8rem' 
              }}>
                {doctor.experience}
              </span>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => handleOpenModal(doctor)} style={{ padding: '0.5rem' }}>
                <FiEdit2 size={16} />
              </button>
              <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.5rem' }} onClick={() => deleteDoctor(doctor.id)}>
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                className="input-field" 
                placeholder="Doctor Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <input 
                className="input-field" 
                placeholder="Specialty" 
                value={formData.specialty} 
                onChange={e => setFormData({...formData, specialty: e.target.value})} 
                required 
              />
              <input 
                className="input-field" 
                placeholder="Experience (e.g. 5 years)" 
                value={formData.experience} 
                onChange={e => setFormData({...formData, experience: e.target.value})} 
                required 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDoctor ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsManagement;
