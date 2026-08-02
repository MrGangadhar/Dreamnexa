import { useEffect, useState } from 'react';
import client from '../api/client';
import ContestCard from '../components/ContestCard';

const TABS = [
  { key: 'upcoming', label: 'Open' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Completed' },
  { key: '', label: 'All' },
];

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all(TABS.filter(t => t.key).map(t =>
      client.get('/contests', { params: { status: t.key } })
        .then(r => ({ key: t.key, count: r.data.length }))
    )).then(results => {
      const c = {};
      results.forEach(({ key, count }) => { c[key] = count; });
      setCounts(c);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    client.get('/contests', { params: tab ? { status: tab } : {} })
      .then(({ data }) => setContests(data))
      .finally(() => setLoading(false));
  }, [tab]);

  const nearlyFull = contests.filter(c =>
    c.status === 'upcoming' && (c.max_participants - c.current_participants) <= 2 && c.current_participants > 0
  );

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ marginBottom: 8, fontSize: 28 }}>Contest Lobby</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find a contest and grab a seat to play.</p>
        </div>

        {/* Filling Fast Banner */}
        {nearlyFull.length > 0 && tab === 'upcoming' && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)' }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span>
              {nearlyFull.length} contest{nearlyFull.length > 1 ? 's are' : ' is'} filling up fast!
            </span>
          </div>
        )}

        {/* Tab Filters */}
        <div className="pill-tabs" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pill-tab ${tab === t.key ? 'active' : ''}`}
            >
              {t.label}
              {t.key && counts[t.key] !== undefined && (
                <span style={{
                  background: tab === t.key ? 'var(--accent)' : 'var(--bg-raised)',
                  color: tab === t.key ? 'white' : 'var(--text-secondary)',
                  borderRadius: 12,
                  padding: '2px 8px',
                  fontSize: 11,
                  marginLeft: 8,
                }}>{counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Contest Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-card)' }} />
            ))}
          </div>
        ) : contests.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
            <h3>No contests found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {contests.map(c => <ContestCard key={c.id} contest={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
