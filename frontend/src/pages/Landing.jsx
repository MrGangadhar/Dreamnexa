import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ContestCard from '../components/ContestCard';

const FEATURES = [
  { icon: '⚡', title: 'Instant Play', body: 'No waiting rooms. Contests start the moment they fill up.' },
  { icon: '🏆', title: 'Win Prizes', body: 'Climb the ranks to earn points and exclusive badges.' },
  { icon: '🆓', title: 'Always Free', body: '100% free to play. No real money or wallet required.' },
  { icon: '📊', title: 'Live Leaderboards', body: 'Compete with friends and track your rank globally.' },
];

export default function Landing() {
  const [liveContests, setLiveContests] = useState([]);
  const [openContests, setOpenContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/contests', { params: { status: 'live' } }),
      client.get('/contests', { params: { status: 'upcoming' } }),
    ]).then(([live, open]) => {
      setLiveContests(live.data.slice(0, 4));
      setOpenContests(open.data.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content" style={{ paddingTop: 0 }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--bg-card)',
        paddingTop: 'calc(var(--nav-height) + 40px)',
        paddingBottom: 60,
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge badge-open" style={{ marginBottom: 16 }}>
            NEW: Campus GK Sprint is live!
          </span>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 24,
            lineHeight: 1.1,
          }}>
            Compete in Live Quizzes.<br />
            <span style={{ color: 'var(--accent)' }}>Win Daily Prizes.</span>
          </h1>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto 32px',
          }}>
            Join free multiplayer quiz contests, test your knowledge, and climb the leaderboard.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Start Playing Free</Link>
            <Link to="/contests" className="btn btn-ghost btn-lg">Browse Contests</Link>
          </div>
        </div>
      </section>

      {/* ── Live Contests ─────────────────────────────────────────── */}
      {liveContests.length > 0 && (
        <section style={{ padding: '60px 0', background: 'var(--bg-primary)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24 }}>Live Now</h2>
              </div>
              <Link to="/contests?status=live" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {liveContests.map(c => <ContestCard key={c.id} contest={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Open Contests ─────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: liveContests.length > 0 ? 'var(--bg-card)' : 'var(--bg-primary)', borderTop: liveContests.length > 0 ? '1px solid var(--border)' : 'none' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24 }}>Open for Entries</h2>
            </div>
            <Link to="/contests" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-card)' }} />
              ))}
            </div>
          ) : openContests.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {openContests.map(c => <ContestCard key={c.id} contest={c} />)}
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
              <h3>No contests open right now</h3>
              <p style={{ color: 'var(--text-muted)' }}>New contests open automatically.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28 }}>Why QuizArena?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
