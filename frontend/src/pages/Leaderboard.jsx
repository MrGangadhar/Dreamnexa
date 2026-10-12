import { useEffect, useState } from 'react';
import client from '../api/client';

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/contests/leaderboard')
      .then(({ data }) => setRows(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = rows.slice(0, 3);
  // Sort top3 so it renders: [Rank 2, Rank 1, Rank 3] for the visual podium
  const podium = [];
  if (top3[1]) podium.push(top3[1]); // Rank 2
  if (top3[0]) podium.push(top3[0]); // Rank 1
  if (top3[2]) podium.push(top3[2]); // Rank 3

  const remaining = rows.slice(3);

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh', paddingTop: 'calc(var(--nav-height))', paddingBottom: 'calc(var(--bottom-nav-h) + 24px)' }}>
      
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0533 0%, #C8102E 65%, #ff4d6d 100%)',
        padding: '24px 0 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>Global Leaderboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 }}>
            Top players ranked by total points earned
          </p>
        </div>
      </div>

      {/* ── Podium (Top 3) ─────────────────────────────────── */}
      {!loading && top3.length > 0 && (
        <div className="container" style={{ marginTop: -32, position: 'relative', zIndex: 3, marginBottom: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 8,
            maxWidth: 420,
            margin: '0 auto',
          }}>
            {/* Rank 2 */}
            {top3[1] && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: '#e2e8f0', border: '2px solid #cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 20, color: '#475569',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}>
                    {(top3[1].full_name || top3[1].username || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ position: 'absolute', bottom: -4, right: -4, fontSize: 16 }}>🥈</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 85 }}>{top3[1].full_name}</div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: '#C8102E', marginTop: 1 }}>{top3[1].total_points.toLocaleString()}</div>
                </div>
                {/* Pedestal */}
                <div style={{
                  width: '100%', height: 60,
                  background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 20, color: '#64748b',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                }}>2</div>
              </div>
            )}

            {/* Rank 1 */}
            {top3[0] && (
              <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-10px)' }}>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  {/* Glow effect */}
                  <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 0%, transparent 80%)', animation: 'pulse 2s infinite' }} />
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fef08a, #facc15)',
                    border: '3px solid #f59e0b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 26, color: '#78350f',
                    boxShadow: '0 6px 16px rgba(245,158,11,0.3)',
                    position: 'relative', zIndex: 1,
                  }}>
                    {(top3[0].full_name || top3[0].username || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 22, zIndex: 2 }}>👑</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 6, position: 'relative', zIndex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{top3[0].full_name}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: '#b45309', marginTop: 1 }}>{top3[0].total_points.toLocaleString()}</div>
                </div>
                {/* Pedestal */}
                <div style={{
                  width: '100%', height: 80,
                  background: 'linear-gradient(180deg, #fef08a 0%, #fde047 100%)',
                  borderRadius: '12px 12px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 24, color: '#b45309',
                  boxShadow: '0 6px 16px rgba(245,158,11,0.25)',
                  border: '1px solid #fef08a',
                  position: 'relative', zIndex: 1,
                }}>1</div>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: '#fed7aa', border: '2px solid #fdba74',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 20, color: '#7c2d12',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}>
                    {(top3[2].full_name || top3[2].username || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ position: 'absolute', bottom: -4, right: -4, fontSize: 16 }}>🥉</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 85 }}>{top3[2].full_name}</div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: '#C8102E', marginTop: 1 }}>{top3[2].total_points.toLocaleString()}</div>
                </div>
                {/* Pedestal */}
                <div style={{
                  width: '100%', height: 48,
                  background: 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 100%)',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 18, color: '#c2410c',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                }}>3</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Table/List Area ────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: 40 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 60, borderRadius: 14 }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '50px 24px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🏆</div>
            <h3 style={{ fontWeight: 700 }}>No rankings yet</h3>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Complete a contest to appear on the leaderboard.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {remaining.map((r, i) => (
              <div key={r.user_id} style={{
                background: '#fff',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                border: '1px solid #f5f5f5',
              }}>
                {/* Rank number */}
                <div style={{
                  width: 32,
                  fontWeight: 800,
                  fontSize: 14,
                  color: '#9ca3af',
                  textAlign: 'center',
                }}>
                  #{r.global_rank}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#f1f5f9', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, color: '#475569',
                  flexShrink: 0,
                }}>
                  {(r.full_name || r.username || 'U')[0].toUpperCase()}
                </div>

                {/* Name / details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.full_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    @{r.username} {r.college && `· ${r.college}`}
                  </div>
                </div>

                {/* Wins Badge */}
                {r.contests_won > 0 && (
                  <div style={{
                    background: 'rgba(25,135,84,0.08)',
                    border: '1px solid rgba(25,135,84,0.25)',
                    borderRadius: 50,
                    padding: '3px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#198754',
                    whiteSpace: 'nowrap',
                  }}>
                    🏆 {r.contests_won} {r.contests_won === 1 ? 'Win' : 'Wins'}
                  </div>
                )}

                {/* Points */}
                <div style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: '#1e293b',
                  textAlign: 'right',
                  marginLeft: 8,
                }}>
                  {r.total_points.toLocaleString()}
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', marginLeft: 2 }}>pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
