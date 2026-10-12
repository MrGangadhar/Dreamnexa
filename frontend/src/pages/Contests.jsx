import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import ContestCard from '../components/ContestCard';
import AdBanner from '../components/AdBanner';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'upcoming',  label: 'Open' },
  { key: 'live',      label: 'Live' },
  { key: 'completed', label: 'Completed' },
  { key: '',          label: 'All' },
];

export default function Contests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  // Contests the logged-in user has registered for
  const [myContests, setMyContests] = useState([]);

  // Fetch tab counts once on mount
  useEffect(() => {
    Promise.all(TABS.filter(t => t.key).map(t =>
      client.get('/contests', { params: { status: t.key } })
        .then(r => ({ key: t.key, count: r.data.length }))
        .catch(() => ({ key: t.key, count: 0 }))
    )).then(results => {
      const c = {};
      results.forEach(({ key, count }) => { c[key] = count; });
      setCounts(c);
    });
  }, []);

  // Fetch contests for the selected tab
  useEffect(() => {
    setLoading(true);
    client.get('/contests', { params: tab ? { status: tab } : {} })
      .then(({ data }) => setContests(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  // Fetch user's registered contests (live & upcoming) so we can highlight them
  useEffect(() => {
    if (!user) { setMyContests([]); return; }
    client.get('/contests/my')
      .then(({ data }) => setMyContests(data))
      .catch(() => setMyContests([]));
  }, [user]);

  const nearlyFull = contests.filter(c =>
    c.status === 'upcoming' && (c.max_participants - c.current_participants) <= 2 && c.current_participants > 0
  );

  // My live / locked contests that are ready to play
  const myLiveContests = myContests.filter(c => c.status === 'live' || c.status === 'locked');

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh', paddingTop: 'calc(var(--nav-height))', paddingBottom: 'calc(var(--bottom-nav-h) + 24px)' }}>

      {/* ── Gradient Header ───────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0533 0%, #C8102E 65%, #ff4d6d 100%)',
        padding: '24px 0 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>Contest Lobby</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 }}>
            Join ongoing or upcoming contests and win rewards
          </p>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────── */}
      <div className="container" style={{ marginTop: -20, position: 'relative', zIndex: 2 }}>

        {/* ── "You're Live!" banner — shown on any tab when user has live contests ── */}
        {myLiveContests.length > 0 && (
          <div style={{
            marginBottom: 14,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(200,16,46,0.15)',
          }}>
            {myLiveContests.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  background: 'linear-gradient(90deg, #1a0533, #C8102E)',
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Animated live dot */}
                  <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: '#4ade80', animation: 'ping 1.2s ease-in-out infinite',
                    }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>
                      🎯 Your contest is LIVE!
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
                      {c.name} · {c.quiz_title}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/contests/${c.id}`)}
                  style={{
                    background: '#fff',
                    color: '#C8102E',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 18px',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  🚀 Start Now
                </button>
              </div>
            ))}
            <style>{`
              @keyframes ping {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(2.2); opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {/* Filling Fast Banner */}
        {nearlyFull.length > 0 && tab === 'upcoming' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(90deg, #fef2f2, #fee2e2)',
            border: '1px solid #fecaca',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 14,
            boxShadow: '0 4px 12px rgba(239,68,68,0.08)',
          }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
              {nearlyFull.length} contest{nearlyFull.length > 1 ? 's are' : ' is'} filling up fast!
            </span>
          </div>
        )}

        {/* Ad Banner */}
        <div style={{ marginBottom: 16 }}>
          <AdBanner position="top" variant={0} />
        </div>

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          {TABS.map(t => {
            const active = tab === t.key;
            // Badge: for the Live tab, show the user's live count if any
            const extraBadge = t.key === 'live' && myLiveContests.length > 0;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: 50,
                  border: extraBadge && !active ? '1.5px solid #C8102E' : 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  background: active ? '#C8102E' : '#fff',
                  color: active ? '#fff' : extraBadge ? '#C8102E' : '#6b7280',
                  boxShadow: active ? '0 4px 14px rgba(200,16,46,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {t.label}
                {extraBadge && !active && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#ef4444',
                    display: 'inline-block',
                    animation: 'ping 1.2s ease-in-out infinite',
                  }} />
                )}
                {t.key && counts[t.key] !== undefined && (
                  <span style={{
                    background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: active ? '#fff' : '#6b7280',
                    borderRadius: 10,
                    padding: '2px 7px',
                    fontSize: 10,
                    fontWeight: 800,
                    marginLeft: 2,
                  }}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Live tab: my registered contests pinned at top ── */}
        {tab === 'live' && myLiveContests.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: '#C8102E',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: '#ef4444',
                display: 'inline-block', animation: 'ping 1.2s ease-in-out infinite',
              }} />
              Your Registered Contests
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {myLiveContests.map(c => (
                <div key={c.id} style={{ position: 'relative' }}>
                  {/* "Registered" ribbon */}
                  <div style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 2,
                    background: '#22c55e', color: '#fff',
                    fontSize: 10, fontWeight: 800, padding: '3px 8px',
                    borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    ✅ Registered
                  </div>
                  <ContestCard contest={c} />
                </div>
              ))}
            </div>
            {/* Divider */}
            {contests.filter(c => !myLiveContests.some(m => m.id === c.id)).length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                margin: '16px 0 8px',
              }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                  Other Live Contests
                </span>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              </div>
            )}
          </div>
        )}

        {/* Contest Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
            ))}
          </div>
        ) : contests.filter(c => tab !== 'live' || !myLiveContests.some(m => m.id === c.id)).length === 0 &&
            !(tab === 'live' && myLiveContests.length > 0) ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🎮</div>
            <h3 style={{ fontWeight: 700 }}>No contests found</h3>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Check back soon for exciting quizzes.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {/* For live tab, exclude already-pinned registered contests */}
            {contests
              .filter(c => tab !== 'live' || !myLiveContests.some(m => m.id === c.id))
              .map(c => <ContestCard key={c.id} contest={c} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
