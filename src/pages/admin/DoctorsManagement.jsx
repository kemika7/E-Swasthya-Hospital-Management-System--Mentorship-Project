import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiMail, FiPhone, FiActivity } from 'react-icons/fi';

const DoctorsManagement = () => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor, specialties, categories, hospitals } = useAdmin();
  const { userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Fallbacks for data from context
  const safeDoctors = Array.isArray(doctors) ? doctors : [];
  const safeSpecialties = Array.isArray(specialties) ? specialties : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeHospitals = Array.isArray(hospitals) ? hospitals : [];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty_id: '',
    hospital_id: userProfile?.hospital_id || '',
    password: '',
    status: 'Active',
    experience: '',
    bio: '',
    fee: '',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Kathmandu',
    qualification: '',
    rating: 0
  });

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      let st = '09:00';
      let et = '17:00';
      if (doctor.working_hours && doctor.working_hours.includes('-')) {
          const parts = doctor.working_hours.split('-');
          st = parts[0].trim();
          et = parts[1].trim();
      }
      setFormData({
        ...doctor,
        specialty_id: doctor.specialty_id || '',
        hospital_id: doctor.hospital_id || '',
        status: doctor.status || 'Active',
        startTime: st,
        endTime: et,
        location: doctor.location || 'Kathmandu',
        qualification: doctor.qualification || '',
        rating: doctor.rating !== undefined ? doctor.rating : 0
      });
      // Try to find category for editing
      const spec = safeSpecialties.find(s => s.id === doctor.specialty_id);
      setSelectedCategoryId(spec?.category_id || '');
    } else {
      setEditingDoctor(null);
      setSelectedCategoryId('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty_id: '',
        hospital_id: userProfile?.hospital_id || '',
        password: '',
        status: 'Active',
        experience: '',
        bio: '',
        fee: '',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Kathmandu',
        qualification: '',
        rating: 0
      });
    }
    setIsModalOpen(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format working hours from start and end time
      let formattedWorkingHours = '9 AM - 5 PM';
      try {
        const formatTime = (timeStr) => {
           if (!timeStr) return '';
           let [h, m] = timeStr.split(':');
           let hour = parseInt(h, 10);
           const ampm = hour >= 12 ? 'PM' : 'AM';
           hour = hour % 12 || 12;
           return `${hour}:${m} ${ampm}`;
        };
        if (formData.startTime && formData.endTime) {
            formattedWorkingHours = `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;
        }
      } catch(err) {
        console.warn('Could not format time tightly, falling back to string append', err);
        formattedWorkingHours = `${formData.startTime} - ${formData.endTime}`;
      }

      const payload = {
          ...formData,
          working_hours: formattedWorkingHours
      };
      
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, payload);
        setMessage({ text: 'Doctor updated successfully', type: 'success' });
      } else {
        await addDoctor(payload);
        setMessage({ text: 'Doctor added successfully', type: 'success' });
      }
      setIsModalOpen(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.message || 'Operation failed. Please check credentials.', type: 'error' });
    }
  };

  const filteredSpecialties = safeSpecialties.filter(spec => 
    !selectedCategoryId || String(spec.category_id) === String(selectedCategoryId)
  );

  return (
    <div className="layout-main" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Doctor Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Hospital: {userProfile?.hospital_name || 'Your Hospital'} (ID: {userProfile?.hospital_id})</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <FiPlus /> Add Doctor
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#15803d' : '#b91c1c',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
        }}>
          {message.type === 'success' ? <FiCheck /> : <FiX />}
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {safeDoctors.map(doctor => (
          <div key={doctor.id} className="card shadow-sm" onClick={() => setViewingDoctor(doctor)} style={{ 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: 'none', 
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--primary)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px',
 
                  backgroundColor: 'rgba(82, 178, 191, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <FiActivity size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{doctor.doctor_name || doctor.name}</h3>
                  <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0 0' }}>{doctor.specialty_name || doctor.specialization}</p>
                </div>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                backgroundColor: doctor.status === 'Inactive' ? '#fee2e2' : '#dcfce7',
                color: doctor.status === 'Inactive' ? '#b91c1c' : '#15803d',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {doctor.status || 'Active'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <FiMail size={14} /> {doctor.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <FiPhone size={14} /> {doctor.phone || 'No phone'}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Exp: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{doctor.experience || 0} yrs</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); handleOpenModal(doctor); }} style={{ padding: '0.5rem', minWidth: 'auto', borderRadius: '8px' }}>
                        <FiEdit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.5rem', minWidth: 'auto', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); deleteDoctor(doctor.id); }}>
                        <FiTrash2 size={16} />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card shadow-lg" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name *</label>
                <input className="input-field" placeholder="Dr. John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required pattern=".* .*" title="Please provide first and last name separated by a space (e.g. John Doe)" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address *</label>
                <input className="input-field" type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number *</label>
                <input className="input-field" placeholder="98XXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required pattern="[0-9]{10}" title="Phone number must be exactly 10 digits." minLength={10} maxLength={10} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hospital *</label>
                <select 
                    className="input-field" 
                    value={formData.hospital_id} 
                    onChange={e => setFormData({ ...formData, hospital_id: e.target.value })} 
                    required
                    style={{ appearance: 'auto' }}
                >
                    <option value="">Select Hospital</option>
                    {safeHospitals.map(hosp => (
                        <option key={hosp.id} value={hosp.id}>{hosp.name}</option>
                    ))}
                    {safeHospitals.length === 0 && <option disabled>Loading hospitals...</option>}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Medical Category *
                </label>
                <select 
                    className="input-field" 
                    value={selectedCategoryId} 
                    onChange={e => {
                        setSelectedCategoryId(e.target.value);
                        setFormData({ ...formData, specialty_id: '' });
                    }} 
                    required
                    style={{ appearance: 'auto' }}
                >
                    <option value="">Select Category</option>
                    {safeCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Speciality *</label>
                <select 
                    className="input-field" 
                    value={formData.specialty_id} 
                    onChange={e => setFormData({ ...formData, specialty_id: e.target.value })} 
                    required
                    style={{ appearance: 'auto' }}
                    disabled={!selectedCategoryId}
                >
                    <option value="">{selectedCategoryId ? 'Select Speciality' : 'Choose Category First'}</option>
                    {filteredSpecialties.map(spec => (
                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Qualification</label>
                <input className="input-field" placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Location</label>
                <select 
                    className="input-field" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    style={{ appearance: 'auto' }}
                >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Biratnagar">Biratnagar</option>
                    <option value="Birgunj">Birgunj</option>
                    <option value="Bharatpur">Bharatpur</option>
                    <option value="Dharan">Dharan</option>
                    <option value="Butwal">Butwal</option>
                    <option value="Janakpur">Janakpur</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Start Time</label>
                  <input className="input-field" type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>End Time</label>
                  <input className="input-field" type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Experience (in years)</label>
                <input className="input-field" type="number" min="0" placeholder="e.g. 5" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rating</label>
                <input className="input-field" type="number" min="0" max="5" step="0.1" placeholder="e.g. 4.5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status</label>
                <select 
                    className="input-field" 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ appearance: 'auto' }}
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
              </div>

              {!editingDoctor && (
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password *</label>
                    <input className="input-field" type="password" placeholder="Enter temporary password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                </div>
              )}


              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>{editingDoctor ? 'Update Doctor' : 'Save Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDoctor && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card shadow-lg" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Doctor Details</h3>
              <button onClick={() => setViewingDoctor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><FiX size={24} /></button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '15px', backgroundColor: 'rgba(82, 178, 191, 0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  <FiActivity size={30} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{viewingDoctor.doctor_name || viewingDoctor.name}</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--primary)', fontWeight: 500 }}>{viewingDoctor.specialty_name || viewingDoctor.specialization}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMail size={14} color="var(--primary)" /> {viewingDoctor.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiPhone size={14} color="var(--primary)" /> {viewingDoctor.phone || 'Not Provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.location || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Working Hours</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.working_hours || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.experience || 0} Years</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qualification</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.qualification || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{viewingDoctor.rating ? `${viewingDoctor.rating} / 5` : 'No Rating'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: viewingDoctor.status === 'Inactive' ? '#fee2e2' : '#dcfce7',
                      color: viewingDoctor.status === 'Inactive' ? '#b91c1c' : '#15803d'
                    }}>
                      {viewingDoctor.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorsManagement;
