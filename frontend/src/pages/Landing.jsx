import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ContestCard from '../components/ContestCard';
import { useSEO } from '../hooks/useSEO';

const CONTENT_CATEGORIES = [
  {
    icon: '🏛️',
    title: 'Government Jobs',
    desc: 'Browse latest central & state government recruitment notifications with eligibility, dates, and official links.',
    to: '/government-jobs',
    accent: '#4338ca',
    bg: '#eef2ff',
  },
  {
    icon: '📰',
    title: 'Current Affairs & GK',
    desc: 'Daily curated current affairs for UPSC, SSC, Banking, Railways, and State PSC exam preparation.',
    to: '/current-affairs',
    accent: '#0369a1',
    bg: '#e0f2fe',
  },
  {
    icon: '📡',
    title: 'News & Updates',
    desc: 'Stay up to date with the latest education news, policy changes, and exam notifications.',
    to: '/news',
    accent: '#15803d',
    bg: '#dcfce7',
  },
  {
    icon: '🏆',
    title: 'Live Quiz Contests',
    desc: 'Join free multiplayer quiz contests, test your knowledge, and climb the national leaderboard.',
    to: '/contests',
    accent: '#C8102E',
    bg: '#fee2e2',
  },
  {
    icon: '📊',
    title: 'Leaderboard',
    desc: 'See top performers across India. Earn points by participating in contests and quizzes.',
    to: '/leaderboard',
    accent: '#b45309',
    bg: '#fef3c7',
  },
  {
    icon: '📚',
    title: 'Mock Tests',
    desc: 'Practice with topic-wise mock tests and get detailed performance feedback.',
    to: '/mock-tests',
    accent: '#7c3aed',
    bg: '#ede9fe',
  },
];

const PLATFORM_STATS = [
  { value: '10k+',  label: 'Registered Students', icon: '🎓', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' },
  { value: '100+', label: 'Govt Job Listings',    icon: '🏛️', gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' },
  { value: '100+', label: 'Quiz Contests Hosted', icon: '🏆', gradient: 'linear-gradient(135deg, #C8102E 0%, #ff4d6d 100%)' },
  { value: '100%', label: 'Verified Official Alerts', icon: '✅', gradient: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)' },
];

export default function Landing() {
  const [liveContests, setLiveContests] = useState([]);
  const [openContests, setOpenContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'DreamNexa — Government Jobs, Current Affairs & Quiz Contests',
    description: 'Educational platform for Indian students. Verified govt job notifications, daily current affairs & GK updates, and competitive campus quiz contests.',
    canonical: 'https://dreamnexa.in/',
  });

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

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #C8102E 65%, #ff4d6d 100%)',
        paddingTop: 'calc(var(--nav-height) + 52px)',
        paddingBottom: 64,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            padding: '4px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.9)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 20, border: '1px solid rgba(255,255,255,0.2)',
          }}>
            India's Student Opportunity &amp; Exam Portal
          </span>
          <h1 style={{
            fontSize: 'clamp(30px, 5.5vw, 52px)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: 20,
            lineHeight: 1.1,
          }}>
            Government Jobs, Current Affairs<br />
            <span style={{ color: '#FFD766' }}>&amp; Live Quiz Contests</span>
          </h1>
          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.82)',
            maxWidth: 620,
            margin: '0 auto 32px',
            lineHeight: 1.65,
          }}>
            One comprehensive platform for competitive exam aspirants — verified government job alerts,
            daily GK &amp; current affairs, and live quiz contests.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/government-jobs" className="btn btn-lg" style={{ background: '#fff', color: '#C8102E', fontWeight: 700, border: 'none' }}>
              🏛️ Explore Govt Jobs
            </Link>
            <Link to="/contests" className="btn btn-lg" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', fontWeight: 600 }}>
              🎯 Play Quiz Contests
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platform Stats Shadow Cards ─────────────────────────────── */}
      <section style={{
        background: 'var(--bg-primary)',
        padding: '36px 0 20px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div className="container">
          <div className="landing-stats-grid">
            {PLATFORM_STATS.map(({ value, label, icon, gradient }) => (
              <div key={label} className="landing-stat-card">
                <div className="landing-stat-icon">{icon}</div>
                <div
                  className="landing-stat-value"
                  style={{
                    background: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {value}
                </div>
                <div className="landing-stat-label">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Categories ─────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
              Everything You Need to Prepare
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
              Government job alerts, current affairs, news, and free quizzes — all in one place.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {CONTENT_CATEGORIES.map(({ icon, title, desc, to, accent, bg }) => (
              <Link
                key={to}
                to={to}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{
                  padding: 24,
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  cursor: 'pointer',
                  height: '100%',
                  boxSizing: 'border-box',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, marginBottom: 14,
                  }}>
                    {icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>{desc}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Contests ──────────────────────────────────────────── */}
      {liveContests.length > 0 && (
        <section style={{ padding: '60px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  color: '#16a34a', background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  borderRadius: 999, padding: '3px 10px', marginBottom: 8,
                }}>
                  🟢 Live Now
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Live Contests</h2>
              </div>
              <Link to="/contests?status=live" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {liveContests.map(c => <ContestCard key={c.id} contest={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Open Contests ──────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: liveContests.length > 0 ? 'var(--bg-primary)' : 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Open for Entries</h2>
            <Link to="/contests" className="btn btn-ghost btn-sm">View All Contests</Link>
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
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>New contests open automatically. Meanwhile, explore our other resources:</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/government-jobs" className="btn btn-ghost btn-sm">🏛️ Govt Jobs</Link>
                <Link to="/current-affairs" className="btn btn-ghost btn-sm">📰 Current Affairs</Link>
                <Link to="/news" className="btn btn-ghost btn-sm">📡 News</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Why DreamNexa ──────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>Why DreamNexa?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Built for students who are serious about their preparation.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { icon: '✅', title: 'Verified Job Listings', body: 'Every government job notification is sourced from official government and recruitment board websites.' },
              { icon: '📅', title: 'Daily GK Updates', body: 'Current affairs and GK summaries for UPSC, SSC, Banking, and State PSC examinations updated regularly.' },
              { icon: '⚖️', title: 'Fair & Pure Merit', body: 'Skill-focused learning. No paywalls, no gambling, and transparent evaluation for every participant.' },
              { icon: '📊', title: 'Live Leaderboards', body: 'Compete with students across India and track your rank in real time after every quiz.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section style={{
        padding: '60px 0',
        background: 'linear-gradient(135deg, #1a0533 0%, #C8102E 100%)',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
            Ready to Start Preparing?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 28 }}>
            Join thousands of students using DreamNexa to prepare for competitive exams.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contests" className="btn btn-lg" style={{ background: '#fff', color: '#C8102E', fontWeight: 700 }}>
              🎯 Enter Contest Arena
            </Link>
            <Link to="/government-jobs" className="btn btn-lg" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)' }}>
              🏛️ Browse Govt Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

