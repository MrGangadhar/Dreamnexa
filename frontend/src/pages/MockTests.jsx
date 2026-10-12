import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import ContestCard from '../components/ContestCard';
import { FiTarget, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

export default function MockTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    client.get('/contests')
      .then(({ data }) => {
        // Filter contests that are named test/trivia/mock or require entry fee
        const filtered = data.filter(c => c.entry_points_cost > 0 || c.name.toLowerCase().includes('test') || c.name.toLowerCase().includes('trivia') || c.name.toLowerCase().includes('mock'));
        setTests(filtered);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load mock tests.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: 28 }}>
            <FiTarget color="var(--accent)" /> Mock Tests
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Practice exam-prep test papers and compete with peers in mock trials.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Mock Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-card)' }} />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 500, margin: '40px auto' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <h3 style={{ marginBottom: 8 }}>No Mock Tests Available</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>There are no mock test contests open right now. Check back soon or visit the contest lobby.</p>
            <button className="btn btn-primary" onClick={() => navigate('/contests')}>
              <FiTrendingUp /> Browse Contest Lobby
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {tests.map(t => (
                <ContestCard key={t.id} contest={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
