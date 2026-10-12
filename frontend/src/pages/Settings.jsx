import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSettings, FiLock, FiAlertTriangle, FiBell, FiEye, FiCheckCircle, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';
import client from '../api/client';

/* Styled App Toggle Switch */
const Toggle = ({ checked, onChange }) => (
  <button 
    type="button"
    onClick={onChange}
    style={{
      width: 48,
      height: 26,
      borderRadius: 13,
      background: checked ? 'var(--accent, #C8102E)' : 'var(--border, #cbd5e1)',
      position: 'relative',
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.2s',
      padding: 0,
      outline: 'none',
      flexShrink: 0,
    }}
  >
    <div style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 3,
      left: checked ? 25 : 3,
      transition: 'left 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }} />
  </button>
);

export default function Settings() {
  const { user } = useAuth();

  // Initialize real preferences from localStorage and DOM state
  const [preferences, setPreferences] = useState(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark';
    const isDarkAttr = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      emailNotifications: localStorage.getItem('pref_email_notifications') !== 'false',
      quizReminders: localStorage.getItem('pref_quiz_reminders') !== 'false',
      darkMode: isDarkStored || isDarkAttr,
      proctoringWarningSound: localStorage.getItem('proctoring_warning_sound') !== 'false',
    };
  });

  // Password change state
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  // Sync dark mode on mount & change
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [preferences.darkMode]);

  const handleToggle = (key) => {
    setPreferences((prev) => {
      const newValue = !prev[key];
      const next = { ...prev, [key]: newValue };

      if (key === 'darkMode') {
        if (newValue) {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
          toast.success('🌙 Dark Theme mode activated');
        } else {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
          toast.success('☀️ Light Theme mode activated');
        }
      } else if (key === 'emailNotifications') {
        localStorage.setItem('pref_email_notifications', JSON.stringify(newValue));
        toast.success(newValue ? '📧 Email notifications enabled' : '🔕 Email notifications disabled');
      } else if (key === 'quizReminders') {
        localStorage.setItem('pref_quiz_reminders', JSON.stringify(newValue));
        toast.success(newValue ? '⏰ Quiz reminders set (10m before start)' : '🔕 Quiz reminders disabled');
      } else if (key === 'proctoringWarningSound') {
        localStorage.setItem('proctoring_warning_sound', JSON.stringify(newValue));
        toast.success(newValue ? '🔊 Proctoring audio warning enabled' : '🔇 Proctoring audio warning muted');
      }

      return next;
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (passForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await client.post('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success(res.data.message || 'Password updated successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePass(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password. Please verify current password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary, #f5f6fa)', minHeight: '100vh', paddingTop: 'calc(var(--nav-height, 60px))', paddingBottom: 'calc(var(--bottom-nav-h, 60px) + 24px)', transition: 'background 0.3s' }}>
      
      {/* ── Gradient Header ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0533 0%, var(--accent, #C8102E) 65%, #ff4d6d 100%)',
        padding: '24px 0 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiSettings size={22} /> Settings & Preferences
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.76)', fontSize: 13, marginTop: 4 }}>
            Customize your notifications, dark theme, proctoring sounds, and account security.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, position: 'relative', zIndex: 2, maxWidth: 640 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Preferences Section */}
          <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card, 0 1px 6px rgba(0,0,0,0.05))', border: '1px solid var(--border, #f0f0f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <FiBell size={18} style={{ color: 'var(--accent, #C8102E)' }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary, #1e293b)' }}>Notification Preferences</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1e293b)', display: 'block' }}>Email Notifications</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: 2 }}>Receive daily login reminders and contest invitations.</span>
                </div>
                <Toggle
                  checked={preferences.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderTop: '1px solid var(--border-light, #f1f5f9)', paddingTop: 16 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1e293b)', display: 'block' }}>Quiz Reminders</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: 2 }}>Notify me 10 minutes before joined contests start.</span>
                </div>
                <Toggle
                  checked={preferences.quizReminders}
                  onChange={() => handleToggle('quizReminders')}
                />
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card, 0 1px 6px rgba(0,0,0,0.05))', border: '1px solid var(--border, #f0f0f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <FiEye size={18} style={{ color: 'var(--accent, #C8102E)' }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary, #1e293b)' }}>Appearance & System</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1e293b)', display: 'block' }}>Dark Theme Mode</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: 2 }}>Use premium dark colors and neon accents for the interface.</span>
                </div>
                <Toggle
                  checked={preferences.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderTop: '1px solid var(--border-light, #f1f5f9)', paddingTop: 16 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1e293b)', display: 'block' }}>Proctoring Alerts Sound</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: 2 }}>Play a warning sound if webcam proctoring flags an activity.</span>
                </div>
                <Toggle
                  checked={preferences.proctoringWarningSound}
                  onChange={() => handleToggle('proctoringWarningSound')}
                />
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card, 0 1px 6px rgba(0,0,0,0.05))', border: '1px solid var(--border, #f0f0f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiLock size={18} style={{ color: 'var(--accent, #C8102E)' }} />
                <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary, #1e293b)' }}>Account Security</h2>
              </div>
              <button
                onClick={() => setShowChangePass(!showChangePass)}
                style={{ background: 'none', border: 'none', color: 'var(--accent, #7c3aed)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <FiKey size={13} /> {showChangePass ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                background: 'var(--bg-raised, #f8fafc)',
                borderRadius: 10,
                border: '1px solid var(--border, #e2e8f0)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>Email Address</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #1e293b)' }}>{user?.email || 'N/A'}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                background: 'var(--bg-raised, #f8fafc)',
                borderRadius: 10,
                border: '1px solid var(--border, #e2e8f0)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>Authentication Role</span>
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: user?.role === 'admin' ? 'rgba(124,58,237,0.1)' : 'rgba(200,16,46,0.08)',
                  color: user?.role === 'admin' ? '#7c3aed' : 'var(--accent, #C8102E)',
                  textTransform: 'uppercase',
                }}>
                  {user?.role || 'Student'}
                </span>
              </div>

              {/* Password Change Form */}
              {showChangePass && (
                <form onSubmit={handlePasswordSubmit} style={{ borderTop: '1px solid var(--border-light, #f1f5f9)', paddingTop: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Update Your Password</h4>
                  
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Current Password</label>
                    <input
                      type="password"
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>New Password (min 8 chars)</label>
                    <input
                      type="password"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passLoading}
                    style={{ padding: '10px 18px', background: 'var(--accent, #7c3aed)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {passLoading ? 'Updating Password...' : <><FiCheckCircle size={14} /> Update Password</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card, 0 1px 6px rgba(0,0,0,0.05))', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FiAlertTriangle size={18} color="#ef4444" />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#ef4444' }}>Danger Zone</h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #64748b)', lineHeight: 1.6, marginBottom: 16, margin: 0 }}>
              Once you request account deletion, all points history, badges, and contest results will be permanently removed.
            </p>
            <a
              href="/contact-us"
              className="btn btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderColor: '#ef4444', color: '#ef4444', borderRadius: 10, fontSize: 13, padding: '10px 16px', marginTop: 12 }}
            >
              Contact Support to Delete Account
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

