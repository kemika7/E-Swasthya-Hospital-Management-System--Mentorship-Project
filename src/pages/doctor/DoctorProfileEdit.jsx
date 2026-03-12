import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/apiClient';
import { FiUser, FiMail, FiPhone, FiMapPin, FiAward, FiSave } from 'react-icons/fi';

const DoctorProfileEdit = () => {
    const { userProfile, updateProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        specialization: '',
        experience: '',
        hospital: '',
        bio: '',
        location: '',
        working_hours: '',
        fee: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiFetch('/doctors/profile');
                setProfile({
                    name: data.name || '',
                    specialization: data.specialization || '',
                    experience: data.experience || '',
                    hospital: data.hospital || '',
                    bio: data.bio || '',
                    location: data.location || '',
                    working_hours: data.working_hours || '',
                    fee: data.fee || ''
                });
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch('/doctors/profile', {
                method: 'PUT',
                body: JSON.stringify(profile)
            });
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="layout-main">Loading profile...</div>;

    return (
        <div className="layout-main">
            <div className="page-header">
                <h2 className="page-title">Edit Profile</h2>
                <p>Update your professional information and settings</p>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label><FiUser style={{ marginRight: '0.5rem' }} /> Full Name</label>
                            <input
                                className="form-input"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="Dr. Name"
                            />
                        </div>
                        <div className="form-group">
                            <label><FiAward style={{ marginRight: '0.5rem' }} /> Specialization</label>
                            <input
                                className="form-input"
                                name="specialization"
                                value={profile.specialization}
                                onChange={handleChange}
                                placeholder="Cardiology, etc."
                            />
                        </div>
                        <div className="form-group">
                            <label>Experience (Years)</label>
                            <input
                                className="form-input"
                                name="experience"
                                type="number"
                                value={profile.experience}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Consultation Fee</label>
                            <input
                                className="form-input"
                                name="fee"
                                type="number"
                                value={profile.fee}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Hospital</label>
                            <input
                                className="form-input"
                                name="hospital"
                                value={profile.hospital}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label><FiMapPin style={{ marginRight: '0.5rem' }} /> Location</label>
                            <input
                                className="form-input"
                                name="location"
                                value={profile.location}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Working Hours</label>
                            <input
                                className="form-input"
                                name="working_hours"
                                value={profile.working_hours}
                                onChange={handleChange}
                                placeholder="e.g. 10 AM - 4 PM"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Bio / Professional Summary</label>
                        <textarea
                            className="form-input"
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows="4"
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-primary"
                            disabled={saving}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FiSave />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorProfileEdit;
