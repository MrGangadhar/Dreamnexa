import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { FiBell, FiAlertCircle, FiCheck, FiMail, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = () => {
    setLoading(true);
    setError('');
    client.get('/notifications')
      .then(({ data }) => {
        setNotifications(data);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load notifications.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = (id) => {
    client.patch(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        toast.success('Marked as read');
      })
      .catch(() => {
        toast.error('Failed to mark notification as read');
      });
  };

  const markAllAsRead = () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    
    Promise.all(unread.map(n => client.patch(`/notifications/${n.id}/read`)))
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        toast.success('All notifications marked as read');
      })
      .catch(() => {
        toast.error('Failed to mark all as read');
      });
  };

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: 28 }}>
              <FiBell color="var(--accent)" /> Notifications
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Stay updated with your active contest updates and announcements.</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>
              <FiCheck /> Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 32 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 64, marginBottom: 12, borderRadius: 8 }} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
              <h3>All caught up!</h3>
              <p style={{ color: 'var(--text-muted)' }}>You have no new notifications.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'transparent' : 'rgba(230,57,70,0.03)',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: n.is_read ? 'var(--bg-raised)' : 'var(--accent-red-soft)',
                    color: n.is_read ? 'var(--text-secondary)' : 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {n.type === 'contest_started' ? <FiMessageSquare size={18} /> : <FiMail size={18} />}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                      <h4 style={{
                        fontSize: 15,
                        fontWeight: n.is_read ? 600 : 700,
                        color: 'var(--text-primary)',
                      }}>{n.title}</h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(n.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 14,
                      color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)',
                      lineHeight: 1.5,
                    }}>{n.message}</p>
                  </div>

                  {/* Mark as read action */}
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        padding: 4,
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
