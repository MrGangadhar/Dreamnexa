import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const statusConfig = {
  upcoming: { label: 'OPEN', cls: 'badge-open' },
  live: { label: 'LIVE', cls: 'badge-live' },
  locked: { label: 'LOCKED', cls: 'badge-open' },
  completed: { label: 'COMPLETED', cls: 'badge-gold' },
};

export default function ContestDetail() {
  const { id } = useParams();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  const load = useCallback(async () => {
    const { data } = await client.get(`/contests/${id}`);
    setContest(data);
    if (data.status === 'completed') {
      const lb = await client.get(`/contests/${id}/leaderboard`);
      setLeaderboard(lb.data);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  if (!contest) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading contest…</p>
      </div>
    );
  }

  const cfg = statusConfig[contest.status] || statusConfig.upcoming;
  const joinedByMe = contest.participants?.some(p => p.username === user?.username);
  const seatsLeft = contest.max_participants - contest.current_participants;
  const fillPct = (contest.current_participants / contest.max_participants) * 100;
  const isFree = !contest.entry_points_cost || contest.entry_points_cost === 0;
  const prizePool = (contest.reward_structure || []).reduce((s, r) => s + (r.points || 0), 0);

  const join = async () => {
    setError('');
    setJoining(true);
    try {
      await client.post(`/contests/${id}/join`);
      await load();
      await refresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not join contest.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '24px 0',
      }}>
        <div className="container">
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => navigate('/contests')}
              style={{
                background: 'none', border: 'none', color: 'var(--accent-blue)',
                fontSize: 14, cursor: 'pointer', padding: 0,
              }}
            >← Back to Contests</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Contest #{contest.sequence_number}</span>
              </div>
              <h1 style={{ marginBottom: 8 }}>{contest.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {contest.quiz_title} • {contest.duration_minutes} min • {contest.negative_marking > 0 ? `-${contest.negative_marking} per wrong answer` : 'No negative marking'}
              </p>
            </div>

            {prizePool > 0 && (
              <div style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px 24px',
                textAlign: 'center',
              }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Prize Pool</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#b37300' }}>
                  {prizePool.toLocaleString()} pts
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Seat Status */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Spot Status</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {contest.current_participants} of {contest.max_participants} spots taken
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: seatsLeft === 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                  {seatsLeft === 0 ? 'FULL' : `${seatsLeft} spots left`}
                </span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 24 }}>
                <div className={`progress-fill ${seatsLeft <= 2 ? 'danger' : ''}`} style={{ width: `${fillPct}%` }} />
              </div>

              {/* Participants */}
              {contest.participants?.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Players Joined</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {contest.participants.map((p, i) => (
                      <div key={p.username} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: p.username === user?.username ? 'var(--accent-blue-soft)' : 'var(--bg-raised)',
                        border: `1px solid ${p.username === user?.username ? 'rgba(13,110,253,0.3)' : 'var(--border)'}`,
                        borderRadius: 20,
                        padding: '4px 12px 4px 4px',
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'var(--border-dark)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0,
                        }}>
                          {(p.full_name || p.username || 'U')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: p.username === user?.username ? 600 : 500, color: p.username === user?.username ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                          {p.username}
                        </span>
                      </div>
                    ))}
                    {Array.from({ length: seatsLeft }).map((_, i) => (
                      <div key={`empty-${i}`} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--bg-primary)',
                        border: '1px dashed var(--border)',
                        borderRadius: 20,
                        padding: '4px 12px',
                      }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)' }}>?</div>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Open</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prizes */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Prize Structure</h3>
              {(contest.reward_structure || []).length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No rewards configured.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(contest.reward_structure || []).map((r, i) => (
                    <div key={r.rank} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: i === 0 ? 'rgba(245, 166, 35, 0.05)' : 'var(--bg-raised)',
                      border: `1px solid ${i === 0 ? 'rgba(245, 166, 35, 0.2)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{RANK_ICONS[r.rank] || `#${r.rank}`}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>Rank {r.rank}</div>
                          {r.badge && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.badge.replace(/_/g, ' ')}</div>}
                        </div>
                      </div>
                      <div style={{
                        fontWeight: 700, fontSize: 16,
                        color: i === 0 ? '#b37300' : 'var(--text-primary)',
                      }}>+{r.points} pts</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results (completed only) */}
            {contest.status === 'completed' && leaderboard.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Final Results</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Rank</th>
                      <th>Player</th>
                      <th style={{ textAlign: 'right' }}>Score</th>
                      <th style={{ textAlign: 'right' }}>Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row) => (
                      <tr key={row.username} style={{ background: row.username === user?.username ? 'var(--accent-blue-soft)' : 'transparent' }}>
                        <td style={{ fontWeight: 700 }}>{RANK_ICONS[row.rank] || `#${row.rank}`}</td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.full_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{row.username}</div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{row.score}</td>
                        <td style={{ textAlign: 'right' }}>
                          {row.points_awarded > 0 && <span style={{ color: '#b37300', fontWeight: 600 }}>+{row.points_awarded}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column — Sticky Join Card */}
          <div>
            <div className="card" style={{
              position: 'sticky', top: 'calc(var(--nav-height) + 24px)',
              padding: 24,
            }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Entry Fee</div>
                <div style={{
                  fontWeight: 800, fontSize: 32,
                  color: isFree ? 'var(--accent-green)' : 'var(--text-primary)',
                }}>
                  {isFree ? 'FREE' : `${contest.entry_points_cost} pts`}
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {!user ? (
                <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/login')}>
                  Log in to Join
                </button>
              ) : joinedByMe ? (
                contest.status === 'live' || contest.status === 'locked' ? (
                  <button
                    className="btn btn-danger btn-full btn-lg"
                    onClick={() => navigate(`/contests/${id}/play`)}
                  >Enter Quiz</button>
                ) : (
                  <div className="alert alert-info" style={{ textAlign: 'center', margin: 0 }}>
                    <strong>You've joined!</strong><br/>Waiting for the contest to start...
                  </div>
                )
              ) : contest.status === 'upcoming' && seatsLeft > 0 ? (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={join}
                  disabled={joining}
                >
                  {joining ? 'Joining...' : 'Join Contest'}
                </button>
              ) : (
                <button className="btn btn-ghost btn-full btn-lg" disabled>
                  {seatsLeft === 0 ? 'Contest Full' : 'Closed'}
                </button>
              )}

              {user && !joinedByMe && contest.status === 'upcoming' && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 16 }}>
                  {isFree ? 'Free entry. No points will be deducted.' : `Your balance: ${user.total_points ?? 0} pts`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
