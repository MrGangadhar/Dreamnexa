import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const TABS = ['My Contests', 'Badges', 'Points History'];

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const statusConfig = {
  upcoming: { label: 'OPEN', cls: 'badge-open' },
  live: { label: 'LIVE', cls: 'badge-live' },
  locked: { label: 'LOCKED', cls: 'badge-open' },
  completed: { label: 'COMPLETED', cls: 'badge-gold' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myContests, setMyContests] = useState([]);
  const [badges, setBadges] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      client.get('/users/me/contests'),
      client.get('/users/me/badges'),
      client.get('/users/me/points'),
    ]).then(([contests, badges, points]) => {
      setMyContests(contests.data);
      setBadges(badges.data);
      setPointsHistory(points.data.slice(0, 20));
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const winRate = user.total_contests > 0
    ? Math.round((user.contests_won / user.total_contests) * 100)
    : 0;

  const copyCode = () => {
    navigator.clipboard.writeText(user.referral_code || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      {/* ── Profile Header ──────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '32px 16px 0' }}>
          {/* Avatar + Name Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 32,
              color: 'var(--text-primary)', flexShrink: 0,
            }}>
              {(user.full_name || user.username || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ marginBottom: 4, lineHeight: 1.2 }}>{user.full_name || user.username}</h1>
              <div style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>
                @{user.username}
                {user.college && <span> • {user.college}</span>}
              </div>
            </div>
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 24px',
              textAlign: 'center',
            }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Balance</div>
              <div style={{ fontWeight: 700, fontSize: 24, color: '#b37300', marginBottom: 8 }}>
                {(user.total_points ?? 0).toLocaleString()} <span style={{ fontSize: 14 }}>pts</span>
              </div>
              <Link to="/wallet" className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 12px' }}>
                Go to Wallet
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { val: user.total_contests ?? 0, label: 'Played' },
              { val: user.contests_won ?? 0, label: 'Won' },
              { val: `${winRate}%`, label: 'Win Rate' },
              { val: badges.length, label: 'Badges' },
            ].map(({ val, label }) => (
              <div key={label} style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{ fontWeight: 700, fontSize: 24, color: 'var(--text-primary)' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="pill-tabs">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`pill-tab ${tab === i ? 'active' : ''}`}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 32 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-card)' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            
            {/* Main Content Area */}
            <div>
              {/* Tab 0: My Contests */}
              {tab === 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {myContests.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>You haven't joined any contests yet.</p>
                      <Link to="/contests" className="btn btn-primary">Browse Contests</Link>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Contest</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                          <th style={{ textAlign: 'center' }}>Rank</th>
                          <th style={{ textAlign: 'right' }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myContests.map(c => {
                          const cfg = statusConfig[c.status] || statusConfig.upcoming;
                          return (
                            <tr key={c.id} onClick={() => navigate(`/contests/${c.id}`)} style={{ cursor: 'pointer' }}>
                              <td>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{c.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.quiz_title}</div>
                              </td>
                              <td style={{ textAlign: 'center' }}><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.rank ? (RANK_ICONS[c.rank] || `#${c.rank}`) : '—'}</td>
                              <td style={{ textAlign: 'right' }}>
                                {c.points_awarded > 0 ? <span style={{ color: '#b37300', fontWeight: 600 }}>+{c.points_awarded}</span> : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 1: Badges */}
              {tab === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {badges.length === 0 ? (
                    <div className="card" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)' }}>You haven't earned any badges yet. Finish in the top 3 of a contest!</p>
                    </div>
                  ) : badges.map(b => (
                    <div key={b.code} className="card" style={{ padding: 24, textAlign: 'center' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>
                        {b.code.includes('gold') ? '🥇' : b.code.includes('silver') ? '🥈' : b.code.includes('bronze') ? '🥉' : '🏅'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{b.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{b.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Points History */}
              {tab === 2 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {pointsHistory.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)' }}>No points activity yet.</p>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pointsHistory.map((tx) => (
                          <tr key={tx.id}>
                            <td>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.description || tx.type.replace(/_/g, ' ')}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: 2 }}>{tx.type.replace(/_/g, ' ')}</div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: tx.amount > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar (Referral) */}
            <div className="hide-mobile">
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 8 }}>Invite Friends</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                  Share your code and you'll both earn bonus points when they sign up.
                </p>
                <div style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 16, letterSpacing: '0.05em' }}>
                    {user.referral_code || '—'}
                  </span>
                  <button onClick={copyCode} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
