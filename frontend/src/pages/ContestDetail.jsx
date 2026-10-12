import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const statusConfig = {
  upcoming:  { label: 'OPEN',      cls: 'badge-open',  color: '#6b7280', bg: '#f1f5f9' },
  live:      { label: 'LIVE',      cls: 'badge-live',  color: '#15803d', bg: '#dcfce7' },
  locked:    { label: 'LIVE',      cls: 'badge-live',  color: '#15803d', bg: '#dcfce7' },
  completed: { label: 'COMPLETED', cls: 'badge-gold',  color: '#b45309', bg: '#fef3c7' },
  cancelled: { label: 'CANCELLED', cls: 'badge-open',  color: '#ef4444', bg: '#fee2e2' },
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
    try {
      const { data } = await client.get(`/contests/${id}`);
      setContest(data);
      if (data.status === 'completed') {
        const lb = await client.get(`/contests/${id}/leaderboard`);
        setLeaderboard(lb.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contest.');
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  if (!contest && !error) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading contest…</p>
      </div>
    );
  }

  if (error && !contest) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        <button className="btn btn-ghost" onClick={() => navigate('/contests')}>Back to Contests</button>
      </div>
    );
  }

  const cfg = statusConfig[contest.status] || statusConfig.upcoming;
  const joinedByMe = contest.participants?.some(p => p.username === user?.username);
  const seatsLeft = contest.max_participants - contest.current_participants;
  const fillPct = Math.min(100, (contest.current_participants / contest.max_participants) * 100);
  const isFree = !contest.entry_points_cost || contest.entry_points_cost === 0;
  const prizePool = (contest.reward_structure || []).reduce((s, r) => s + (r.points || 0), 0);
  const isLive = contest.status === 'live' || contest.status === 'locked';
  const isCompleted = contest.status === 'completed';
  const isCancelled = contest.status === 'cancelled';

  const join = async () => {
    if (!user) { navigate('/login'); return; }
    setError('');
    setJoining(true);
    try {
      await client.post(`/contests/${id}/join`);
      await load();
      await refresh();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details || 'Could not join contest.';
      setError(msg);
    } finally {
      setJoining(false);
    }
  };

  const renderActionButton = (isMobile = false) => {
    const btnStyle = {
      width: '100%',
      padding: isMobile ? '12px' : '14px',
      borderRadius: 12,
      fontWeight: 800,
      fontSize: 14,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'block',
    };

    if (!user) {
      return (
        <button 
          style={{ ...btnStyle, background: '#C8102E', color: '#fff' }} 
          onClick={() => navigate('/login')}
        >
          Log in to Join
        </button>
      );
    }

    if (isCompleted) {
      return (
        <button
          style={{ ...btnStyle, background: '#C8102E', color: '#fff' }}
          onClick={() => navigate(`/contests/${id}`)}
        >
          View Result
        </button>
      );
    }

    if (isCancelled) {
      return (
        <button style={{ ...btnStyle, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }} disabled>
          Contest Cancelled
        </button>
      );
    }

    if (joinedByMe) {
      if (isLive) {
        return (
          <button
            style={{ ...btnStyle, background: '#ef4444', color: '#fff', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}
            onClick={() => navigate(`/contests/${id}/play`)}
          >
            🚀 Start Contest
          </button>
        );
      }
      return (
        <div style={{
          background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12,
          padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#15803d'
        }}>
          ✅ Registered
        </div>
      );
    }

    if (isLive) {
      return (
        <button style={{ ...btnStyle, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }} disabled>
          Contest is Live
        </button>
      );
    }

    if (seatsLeft <= 0) {
      return (
        <button style={{ ...btnStyle, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }} disabled>
          Contest Full
        </button>
      );
    }

    if (contest.status === 'upcoming') {
      return (
        <button
          style={{ ...btnStyle, background: '#C8102E', color: '#fff', boxShadow: '0 4px 14px rgba(200,16,46,0.25)' }}
          onClick={join}
          disabled={joining}
        >
          {joining ? 'Joining…' : 'Join Contest'}
        </button>
      );
    }

    return (
      <button style={{ ...btnStyle, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }} disabled>
        Contest Ended
      </button>
    );
  };

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh', paddingTop: 'calc(var(--nav-height))', paddingBottom: 'calc(var(--bottom-nav-h) + 16px)' }}>
      
      <style>{`
        @media (max-width: 768px) {
          .detail-layout-grid {
            grid-template-columns: 1fr !important;
            padding-bottom: 140px !important;
          }
          .desktop-join-card {
            display: none !important;
          }
          .mobile-bottom-bar {
            display: flex !important;
          }
        }
      `}</style>

      {/* ── Gradient Header ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0533 0%, #C8102E 65%, #ff4d6d 100%)',
        padding: '20px 0 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div className="container">
          <div style={{ marginBottom: 12 }}>
            <Link to="/contests" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Lobby
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, color: cfg.color, background: cfg.bg, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {cfg.label}
                </span>
                {Boolean(contest.proctoring_enabled) && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, color: '#15803d', background: '#dcfce7', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    🛡️ AI PROCTORED
                  </span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: 600 }}>Contest #{contest.sequence_number}</span>
              </div>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>{contest.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, margin: 0 }}>
                {contest.quiz_title} · {contest.duration_minutes} mins · {contest.negative_marking > 0 ? `-${contest.negative_marking} mark` : 'No negative marks'}
              </p>
            </div>

            {prizePool > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 14,
                padding: '10px 18px',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', letterSpacing: '0.04em' }}>Prize Pool</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2 }}>
                  {prizePool.toLocaleString()} pts
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────── */}
      <div className="container" style={{ marginTop: -20, position: 'relative', zIndex: 2 }}>
        <div className="detail-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {error && (
              <div className="alert alert-error" style={{ fontSize: 13, padding: '12px 16px', borderRadius: 12 }}>
                {error}
              </div>
            )}

            {/* AI Proctoring Notice Card */}
            {Boolean(contest.proctoring_enabled) && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 26, flexShrink: 0 }}>🛡️</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 2 }}>
                    AI Proctoring Active
                  </div>
                  <div style={{ fontSize: 12, color: '#15803d', lineHeight: 1.45 }}>
                    This contest requires webcam, microphone, and tab-focus monitoring. A quick automated system readiness check will verify your setup before you start.
                  </div>
                </div>
              </div>
            )}
            
            {/* Spot Status */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Spot Status</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  {contest.current_participants} of {contest.max_participants} joined
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: seatsLeft === 0 ? '#ef4444' : '#10b981' }}>
                  {seatsLeft === 0 ? 'FULL' : `${seatsLeft} left`}
                </span>
              </div>
              
              <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ height: '100%', background: seatsLeft <= 2 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #059669)', width: `${fillPct}%` }} />
              </div>

              {/* Joined Players */}
              {contest.participants?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: 10 }}>Players Joined</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {contest.participants.map(p => (
                      <div key={p.username} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: p.username === user?.username ? 'rgba(13,110,253,0.08)' : '#f8fafc',
                        border: `1px solid ${p.username === user?.username ? 'rgba(13,110,253,0.2)' : '#e2e8f0'}`,
                        borderRadius: 20,
                        padding: '3px 10px 3px 3px',
                      }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>
                          {(p.full_name || p.username || 'U')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: p.username === user?.username ? '#0d6efd' : '#475569' }}>
                          {p.username}
                        </span>
                      </div>
                    ))}
                    {Array.from({ length: Math.min(6, seatsLeft) }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 20, padding: '3px 10px' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>?</div>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Open</span>
                      </div>
                    ))}
                    {seatsLeft > 6 && (
                      <div style={{ padding: '4px 10px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                        + {seatsLeft - 6} more spots
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Prize Structure */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Prize Breakup</h3>
              {(contest.reward_structure || []).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No rewards configured.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(contest.reward_structure || []).map((r, i) => (
                    <div key={r.rank} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: i === 0 ? '#fef3c7' : '#f8fafc',
                      border: `1px solid ${i === 0 ? '#fde68a' : '#e2e8f0'}`,
                      borderRadius: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{RANK_ICONS[r.rank] || `#${r.rank}`}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Rank {r.rank}</div>
                          {r.badge && <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{r.badge.replace(/_/g, ' ')}</div>}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: i === 0 ? '#b45309' : '#475569' }}>
                        +{r.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results (completed only) */}
            {contest.status === 'completed' && leaderboard.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Leaderboard</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px 10px', fontSize: 11 }}>Rank</th>
                        <th style={{ padding: '8px 10px', fontSize: 11 }}>Player</th>
                        <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'right' }}>Score</th>
                        <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'right' }}>Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((row) => (
                        <tr key={row.username} style={{ background: row.username === user?.username ? 'rgba(13,110,253,0.08)' : 'transparent' }}>
                          <td style={{ padding: '10px 10px', fontWeight: 800, fontSize: 13 }}>{RANK_ICONS[row.rank] || `#${row.rank}`}</td>
                          <td style={{ padding: '10px 10px' }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{row.full_name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>@{row.username}</div>
                          </td>
                          <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{row.score}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#b45309' }}>
                            {row.points_awarded > 0 ? `+${row.points_awarded}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Desktop Sticky Card */}
          <div className="desktop-join-card">
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', position: 'sticky', top: 'calc(var(--nav-height) + 20px)' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>Entry Fee</div>
                <div style={{ fontWeight: 900, fontSize: 26, color: isFree ? '#16a34a' : '#1e293b', marginTop: 4 }}>
                  {isFree ? 'FREE' : `${contest.entry_points_cost} pts`}
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ fontSize: 12, padding: '10px 12px', marginBottom: 14 }}>{error}</div>}

              {renderActionButton()}

              {user && !joinedByMe && contest.status === 'upcoming' && (
                <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12, fontWeight: 600 }}>
                  {isFree ? 'No points will be deducted.' : `Your balance: ${user.total_points.toLocaleString()} pts`}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar ───────────────── */}
      <div className="mobile-bottom-bar" style={{
        display: 'none',
        position: 'fixed',
        bottom: 'var(--bottom-nav-h, 62px)', left: 0, right: 0,
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
        zIndex: 250,
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entry Fee</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: isFree ? '#16a34a' : '#1e293b', marginTop: 2 }}>
            {isFree ? 'FREE' : `${contest.entry_points_cost} pts`}
          </div>
        </div>
        <div style={{ flex: 1, marginLeft: 20, maxWidth: 200 }}>
          {renderActionButton(true)}
        </div>
      </div>

    </div>
  );
}
