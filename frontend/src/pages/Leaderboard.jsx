import { useEffect, useState } from 'react';
import client from '../api/client';

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/contests/leaderboard').then(({ data }) => setRows(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <h1 style={{ marginBottom: 8 }}>Global Leaderboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ranked by total points earned across all contests.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 900 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <h3>No rankings yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Complete a contest to appear on the leaderboard.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: 80, textAlign: 'center' }}>Rank</th>
                  <th>Player</th>
                  <th>College</th>
                  <th style={{ textAlign: 'center' }}>Wins</th>
                  <th style={{ textAlign: 'right' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isTop3 = r.global_rank <= 3;
                  return (
                    <tr key={r.user_id} style={{ background: isTop3 ? 'var(--accent-yellow-soft)' : 'transparent' }}>
                      <td style={{ textAlign: 'center', fontSize: 20 }}>
                        {RANK_ICONS[r.global_rank] || <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>#{r.global_rank}</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--bg-raised)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                          }}>
                            {(r.full_name || r.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.full_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{r.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{r.college || '—'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.contests_won}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: isTop3 ? '#b37300' : 'var(--text-primary)' }}>
                        {r.total_points.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
