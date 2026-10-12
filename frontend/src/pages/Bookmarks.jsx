import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { FiBookmark, FiAlertCircle, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookmarks = () => {
    setLoading(true);
    setError('');
    client.get('/news/bookmarks')
      .then(({ data }) => {
        // The API returns { bookmarks: [...] }
        setBookmarks(data.bookmarks || []);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load bookmarks.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const removeBookmark = (id) => {
    client.delete(`/news/bookmark/${id}`)
      .then(() => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
        toast.success('Bookmark removed');
      })
      .catch(() => {
        toast.error('Failed to remove bookmark');
      });
  };

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: 28 }}>
            <FiBookmark color="var(--accent)" /> Bookmarks
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Access your saved news articles and government jobs listings.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Bookmarks List */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 32 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 72, marginBottom: 12, borderRadius: 8 }} />
              ))}
            </div>
          ) : bookmarks.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
              <h3>No Bookmarks Yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Bookmarked articles and jobs will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {bookmarks.map(b => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--accent)',
                        background: 'var(--accent-red-soft)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                      }}>
                        {b.source || 'News'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {b.published_at ? new Date(b.published_at).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      marginBottom: 6,
                    }}>
                      {b.title}
                    </h3>
                    {b.url && (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--accent-blue)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Read Original Article <FiExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeBookmark(b.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 8,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--accent-red)';
                      e.currentTarget.style.backgroundColor = 'var(--accent-red-soft)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Remove Bookmark"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
