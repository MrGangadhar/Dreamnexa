/**
 * AboutUs.jsx — About Us page for DreamNexa
 *
 * Required for Google AdSense review and general site credibility.
 * Describes mission, platform features, and team ethos without
 * fabricated addresses, phone numbers, or registration numbers.
 */

import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const PILLARS = [
  {
    icon: '🏛️',
    title: 'Government Job Alerts',
    body: 'We publish official recruitment notifications from central and state governments, including eligibility, vacancies, dates, and official links — helping students plan their exam journey without sifting through unreliable sources.',
  },
  {
    icon: '📰',
    title: 'Current Affairs & GK',
    body: 'Our editorial team curates daily current affairs and general knowledge updates for students preparing for UPSC, SSC, Banking, Railway, and State PSC examinations.',
  },
  {
    icon: '🧠',
    title: 'Free Live Quiz Contests',
    body: 'Students can join real-time multiplayer quiz contests, earn points on our digital leaderboard, and compete with peers across India — all completely free.',
  },
  {
    icon: '📊',
    title: 'Mock Tests & Practice',
    body: 'Practice-mode quiz sessions help students assess their preparation level with detailed performance feedback and attempt-by-attempt analysis.',
  },
];

const VALUES = [
  { icon: '✅', title: 'Accuracy', body: 'We link to official sources for every government job notification and current affairs reference. We clearly label unverified information.' },
  { icon: '🆓', title: 'Free Access', body: 'All core features — government job listings, current affairs articles, and quiz contests — are free to access without a subscription or wallet.' },
  { icon: '🔒', title: 'Privacy', body: 'We collect only the data needed to operate the platform. We do not sell personal information. Read our full Privacy Policy for details.' },
  { icon: '⚖️', title: 'Integrity', body: 'Our points system has no real monetary value. We do not make misleading prize claims. All contest rules and reward structures are transparently documented.' },
];

export default function AboutUs() {
  useSEO({
    title: 'About Us — DreamNexa | Mission, Vision & Platform Values',
    description: 'Learn about DreamNexa: our mission to provide free educational quizzes, verified government job alerts, and daily current affairs for Indian aspirants.',
    canonical: 'https://dreamnexa.in/about',
  });

  return (
    <div className="page-content" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #C8102E 70%, #ff4d6d 100%)',
        padding: '72px 0 56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div className="container">
          <div style={{ fontSize: 52, marginBottom: 20 }}>⚡</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.15 }}>
            About DreamNexa
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.82)', maxWidth: 620, margin: '0 auto 28px', lineHeight: 1.65 }}>
            A free-to-use educational platform helping Indian students discover government jobs,
            stay informed with current affairs, and sharpen their knowledge through live quiz contests.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contests" className="btn btn-primary btn-lg" style={{ background: '#fff', color: '#C8102E' }}>
              Explore Contests
            </Link>
            <Link to="/government-jobs" className="btn btn-ghost btn-lg" style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}>
              Browse Govt Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mission ───────────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', display: 'block', marginBottom: 10 }}>
              Our Mission
            </span>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 18 }}>
              Empowering Students with Knowledge
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 720, margin: '0 auto' }}>
              Millions of students across India prepare for competitive examinations — UPSC, SSC, Banking,
              Railways, State PSC, and campus placement drives — while also navigating a constant stream of
              government recruitment notifications. DreamNexa exists to make that preparation easier, more
              engaging, and entirely free.
            </p>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 720, margin: '20px auto 0' }}>
              We publish verified government job alerts, curated current affairs and GK summaries, and run
              live multiplayer quiz contests that let students test their knowledge against each other in
              real time. All features are free. There is no wallet, no entry fee, and no cash prize — just
              genuine knowledge-building and healthy competition.
            </p>
          </div>
        </div>
      </section>

      {/* ── What We Offer ─────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', display: 'block', marginBottom: 10 }}>
              What We Offer
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
              Four Core Services, One Platform
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {PILLARS.map(({ icon, title, body }) => (
              <div key={title} className="card" style={{ padding: 28 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Values ────────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', display: 'block', marginBottom: 10 }}>
              Our Values
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
              What We Stand For
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
            {VALUES.map(({ icon, title, body }) => (
              <div key={title} style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                padding: 24,
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Standards ─────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>
            Content Standards & Editorial Approach
          </h2>
          <div className="card" style={{ padding: 28, lineHeight: 1.75, color: 'var(--text-secondary)', fontSize: 15 }}>
            <p style={{ marginBottom: 14 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Government Job Notifications:</strong>{' '}
              All job listings are sourced from official government websites and verified before publication.
              Where specific details such as exact vacancies, age relaxations, or fee structures cannot be
              immediately verified from the official notification, we clearly note this. We always link to
              the original government or recruitment board source.
            </p>
            <p style={{ marginBottom: 14 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Current Affairs:</strong>{' '}
              Our editorial team reviews each current affairs article before it is published. We distinguish
              between confirmed facts and analysis. We cite official sources wherever available.
            </p>
            <p style={{ marginBottom: 14 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Quiz Questions:</strong>{' '}
              Quiz questions and answer keys are reviewed for accuracy. If you believe a question contains
              an error, please report it through our{' '}
              <Link to="/contact-us" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Contact Us</Link> page.
            </p>
            <p>
              <strong style={{ color: 'var(--text-primary)' }}>Corrections:</strong>{' '}
              We are committed to correcting errors promptly. Our{' '}
              <Link to="/editorial-policy" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Editorial Policy</Link>{' '}
              explains our correction process in detail.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Get in Touch</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
            Have a question, a correction request, or a suggestion? We would love to hear from you.
            Reach out through our contact form or email us at{' '}
            <a href="mailto:support@dreamnexa.in" style={{ color: 'var(--accent)' }}>support@dreamnexa.in</a>.
          </p>
          <Link to="/contact-us" className="btn btn-primary btn-lg">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
