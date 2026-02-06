import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const DoctorsManagement = () => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: '',
    name: '',
    category: '',
    subcategory: '',
    specialization: '',
    location: '',
    experience: '',
    patientsCount: '',
    reviews: '',
    workingHours: '',
    bloodGroup: '',
    dateOfBirth: '',
    image: '',
  });

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData(doctor);
    } else {
      setEditingDoctor(null);
      setFormData({
        doctorId: '',
        name: '',
        category: '',
        subcategory: '',
        specialization: '',
        location: '',
        experience: '',
        patientsCount: '',
        reviews: '',
        workingHours: '',
        bloodGroup: '',
        dateOfBirth: '',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDoctor) {
      updateDoctor(editingDoctor.doctorId, formData);
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
          <div key={doctor.doctorId} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{doctor.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doctor.specialization}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{doctor.category} • {doctor.subcategory}</p>
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>Working Hours: {doctor.workingHours}</div>
              <div>Location: {doctor.location}</div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => handleOpenModal(doctor)} style={{ padding: '0.5rem' }}>
                <FiEdit2 size={16} />
              </button>
              <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.5rem' }} onClick={() => deleteDoctor(doctor.doctorId)}>
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!editingDoctor && (
                <input
                  className="input-field"
                  placeholder="Doctor ID (unique)"
                  value={formData.doctorId}
                  onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                />
              )}
              <input className="input-field" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              <input className="input-field" placeholder="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
              <input className="input-field" placeholder="Subcategory" value={formData.subcategory} onChange={e => setFormData({ ...formData, subcategory: e.target.value })} required />
              <input className="input-field" placeholder="Specialization" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} required />
              <input className="input-field" placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
              <input className="input-field" placeholder="Experience (years e.g. 10 years)" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} required />
              <input className="input-field" placeholder="Patients Count (e.g. 2,000+)" value={formData.patientsCount} onChange={e => setFormData({ ...formData, patientsCount: e.target.value })} required />
              <input className="input-field" placeholder="Reviews (e.g. 1.8k)" value={formData.reviews} onChange={e => setFormData({ ...formData, reviews: e.target.value })} required />
              <input className="input-field" placeholder="Working Hours" value={formData.workingHours} onChange={e => setFormData({ ...formData, workingHours: e.target.value })} required />
              <input className="input-field" placeholder="Blood Group" value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} required />
              <input className="input-field" placeholder="Date of Birth (DD-MM-YYYY)" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
              <input className="input-field" placeholder="Image Path" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />
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
