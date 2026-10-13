/**
 * AdBanner.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable ad banner component.
 *
 * Renders a REAL Google AdSense unit once these are set (see .env.example):
 *   VITE_ADSENSE_CLIENT, and VITE_ADSENSE_SLOT_TOP / _INLINE / _SIDEBAR
 *   (one slot ID per position, created in AdSense > Ads > By ad unit).
 *
 * Until then — e.g. while AdSense review is pending — it automatically
 * falls back to the original house/promo creative below, so there's never
 * an empty box on the page. Nothing else in the app needs to change:
 * every existing <AdBanner position="..." /> call site keeps working.
 *
 * Props:
 *   position  'top' | 'inline' | 'sidebar'   (default: 'inline')
 *   variant   0-based index to pick a different HOUSE ad creative
 *             (ignored once real AdSense ads are active — Google picks
 *             what to show)
 *   dismissible  boolean — show close button on the HOUSE creative only
 *                (default: true). Real ads are never dismissible — that
 *                would violate AdSense policy.
 *
 * Usage (unchanged):
 *   <AdBanner position="top" />
 *   <AdBanner position="inline" variant={1} />
 *   <AdBanner position="sidebar" />
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/ads.css';

/* ── AdSense config (blank until you're approved — see .env.example) ────── */
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || '';
const ADSENSE_SLOTS = {
  top: import.meta.env.VITE_ADSENSE_SLOT_TOP || '',
  inline: import.meta.env.VITE_ADSENSE_SLOT_INLINE || '',
  sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '',
};

/** True once a real ad unit is configured for this position. */
function hasRealAdConfigured(position) {
  return Boolean(ADSENSE_CLIENT && ADSENSE_SLOTS[position]);
}

/* ── House ad creatives (fallback, shown until AdSense is live) ─────────── */
const HORIZONTALS = [
  {
    icon: '🚀',
    title: 'Crack Your Dream Exam with AI-Powered Practice',
    sub: 'Join 2 lakh+ students • 5000+ questions • Live mock tests every week',
    cta: 'Start Free Today',
    href: '#',
  },
  {
    icon: '🏆',
    title: 'Compete. Win. Grow — Real Contest. Real Rewards.',
    sub: 'Daily quizzes • Weekend challenges • Leaderboard glory',
    cta: 'Join a Contest',
    href: '#',
  },
];

const INLINES = [
  {
    gradient: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#164e63 100%)',
    icon: '📚',
    title: 'DreamNexa Pro — Unlimited Mock Tests',
    sub: 'Ace UPSC, SSC, Banking & more with personalised study plans.',
    cta: '🎯 Try 7 Days Free',
  },
  {
    gradient: 'linear-gradient(135deg,#1a0533 0%,#2d1154 50%,#3b0764 100%)',
    icon: '⚡',
    title: 'Current Affairs Quiz — Daily 10 Questions',
    sub: 'Stay ahead of the competition. Powered by today\'s top news.',
    cta: '✨ Play Now — It\'s Free',
  },
  {
    gradient: 'linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)',
    icon: '🎁',
    title: 'Refer & Earn 100 Bonus Points',
    sub: 'Invite classmates to DreamNexa and earn bonus points instantly.',
    cta: '🎁 Invite Friends',
  },
];

const SIDEBARS = [
  {
    badge: '🔥 Hot Deal',
    icon: '🎓',
    title: 'DreamNexa Pro Membership',
    sub: 'Unlimited quizzes, AI analysis, priority support & ad-free experience.',
    cta: 'Upgrade Now',
  },
  {
    badge: '⭐ Featured',
    icon: '📰',
    title: 'Daily Current Affairs Digest',
    sub: 'Get curated exam-ready news summaries delivered every morning.',
    cta: 'Subscribe Free',
  },
];

/* ── Real Google AdSense unit ─────────────────────────────────────────────
 * One <ins class="adsbygoogle"> per slot, pushed to the adsbygoogle queue
 * once it mounts. Guarded so it never double-pushes the same <ins> (which
 * AdSense throws on) — safe under React StrictMode's double-invoke in dev.
 * ────────────────────────────────────────────────────────────────────── */
function GoogleAdSlot({ position }) {
  const insRef = useRef(null);

  useEffect(() => {
    try {
      if (insRef.current && !insRef.current.getAttribute('data-adsbygoogle-status')) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // AdSense not yet approved / script blocked (ad-blocker, offline, dev
      // preview, etc.) — fail silently rather than break the page.
    }
  }, []);

  const minHeight = position === 'top' ? 90 : position === 'sidebar' ? 250 : 120;

  return (
    <div className={`ad-banner-wrap ad-banner-google ad-banner-google-${position}`}>
      <span className="ad-label-external">Advertisement</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOTS[position]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function AdBanner({ position = 'inline', variant = 0, dismissible = true }) {
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // STRICT REQUIREMENT: Zero ads during test time / quiz play screens
  if (
    location.pathname.includes('/play') ||
    location.pathname.includes('/test') ||
    (typeof document !== 'undefined' && document.body.classList.contains('test-mode-no-ads'))
  ) {
    return null;
  }

  if (dismissed) return null;

  // Real AdSense unit configured for this position → show it, no fallback UI.
  if (hasRealAdConfigured(position)) {
    return <GoogleAdSlot position={position} />;
  }

  /* ── Fallback: house creative (identical to pre-AdSense behaviour) ─────── */

  /* ── Horizontal ────────────────────────────────────────────────────────── */
  if (position === 'top') {
    const ad = HORIZONTALS[variant % HORIZONTALS.length];
    return (
      <div className="ad-banner-wrap ad-banner-horizontal" role="complementary" aria-label="Advertisement">
        <span className="ad-chip">Ad</span>
        {dismissible && (
          <button className="ad-close-btn" onClick={() => setDismissed(true)} aria-label="Close ad">✕</button>
        )}
        <div className="ad-icon" aria-hidden="true">{ad.icon}</div>
        <div className="ad-content">
          <p className="ad-title">{ad.title}</p>
          <p className="ad-sub">{ad.sub}</p>
        </div>
        <button className="ad-cta-btn" onClick={() => window.open(ad.href, '_blank')}>{ad.cta}</button>
      </div>
    );
  }

  /* ── Sidebar ────────────────────────────────────────────────────────────── */
  if (position === 'sidebar') {
    const ad = SIDEBARS[variant % SIDEBARS.length];
    return (
      <div className="ad-banner-wrap ad-banner-sidebar" role="complementary" aria-label="Advertisement">
        <span className="ad-chip">Ad</span>
        {dismissible && (
          <button className="ad-close-btn" onClick={() => setDismissed(true)} aria-label="Close ad">✕</button>
        )}
        <span className="ad-sidebar-badge">{ad.badge}</span>
        <div className="ad-sidebar-icon" aria-hidden="true">{ad.icon}</div>
        <p className="ad-sidebar-title">{ad.title}</p>
        <p className="ad-sidebar-sub">{ad.sub}</p>
        <button className="ad-sidebar-cta">{ad.cta}</button>
      </div>
    );
  }

  /* ── Inline (default) ──────────────────────────────────────────────────── */
  const ad = INLINES[variant % INLINES.length];
  return (
    <div
      className="ad-banner-wrap ad-banner-inline"
      style={{ background: ad.gradient }}
      role="complementary"
      aria-label="Advertisement"
    >
      <span className="ad-chip">Ad</span>
      {dismissible && (
        <button className="ad-close-btn" onClick={() => setDismissed(true)} aria-label="Close ad">✕</button>
      )}
      <div className="ad-inline-body" style={{ paddingTop: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }} aria-hidden="true">{ad.icon}</div>
        <p className="ad-inline-title">{ad.title}</p>
        <p className="ad-inline-sub">{ad.sub}</p>
        <button className="ad-inline-cta">{ad.cta}</button>
      </div>
    </div>
  );
}
