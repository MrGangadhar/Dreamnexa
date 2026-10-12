import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import toast from 'react-hot-toast';
import { FiUser, FiSave, FiMapPin, FiBookOpen, FiAward } from 'react-icons/fi';

export default function Profile() {
  const { user, refresh } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user?.full_name || '',
    college: user?.college || '',
    university: user?.university || '',
    state: user?.state || '',
    city: user?.city || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!profile.fullName.trim()) errs.fullName = 'Full Name is required.';
    return errs;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await client.patch('/users/me', profile);
      await refresh();
      toast.success('Profile updated successfully!');
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh', paddingTop: 'calc(var(--nav-height))', paddingBottom: 'calc(var(--bottom-nav-h) + 24px)' }}>
      
      {/* ── Gradient Header ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0533 0%, #C8102E 65%, #ff4d6d 100%)',
        padding: '24px 0 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#FFD766,#F5A623)',
              color: '#3a2600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              border: '3px solid rgba(255,255,255,0.3)',
              flexShrink: 0,
            }}>
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{user?.full_name || user?.username}</h1>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, margin: 0 }}>@{user?.username} · Student Member</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, position: 'relative', zIndex: 2, maxWidth: 800 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          
          {/* Stats Summary Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAward color="#C8102E" /> Achievements
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Points Balance</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#b37300' }}>
                    {(user?.total_points ?? 0).toLocaleString()} pts
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Contests Played</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                    {user?.total_contests || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Quizzes Played</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                    {user?.total_quizzes_played || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Contests Won</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#198754' }}>
                    {user?.contests_won || 0}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBookOpen color="#C8102E" /> Education
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {user?.college ? `${user.college}` : 'No college added yet.'}
                {user?.university ? ` (${user.university})` : ''}
              </p>
            </div>
          </div>

          {/* Profile Edit Column */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <FiUser size={18} color="#C8102E" />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#1e293b' }}>Edit Profile</h2>
            </div>

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.fullName}
                  onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    border: errors.fullName ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                  }}
                />
                {errors.fullName && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, margin: 0 }}>{errors.fullName}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                  College / Institution
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.college}
                  onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
                  placeholder="e.g. IIT Delhi"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                  University
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.university}
                  onChange={e => setProfile(p => ({ ...p, university: e.target.value }))}
                  placeholder="e.g. University of Delhi"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                    State
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.state}
                    onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                    City
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.city}
                    onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{
                  alignSelf: 'stretch',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 10,
                  borderRadius: 12,
                  padding: 12,
                  background: '#C8102E',
                }}
              >
                <FiSave size={15} />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
