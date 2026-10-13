/**
 * Footer.jsx — Site-wide footer for DreamNexa
 *
 * Google AdSense reviewers check that Privacy Policy, Terms, Contact,
 * About, and Disclaimer pages are easily discoverable. This footer
 * ensures every page has those links visible.
 *
 * Excluded from: /admin routes (admin has its own shell)
 */

import { Link, useLocation } from 'react-router-dom';

const FOOTER_LINKS = {
  'Quick Links': [
    { to: '/government-jobs', label: 'Government Jobs' },
    { to: '/current-affairs', label: 'Current Affairs' },
    { to: '/news', label: 'News & Updates' },
    { to: '/contests', label: 'Quiz Contests' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ],
  'Company': [
    { to: '/about', label: 'About Us' },
    { to: '/contact-us', label: 'Contact Us' },
    { to: '/help-support', label: 'Help & Support' },
    { to: '/editorial-policy', label: 'Editorial Policy' },
  ],
  'Legal': [
    { to: '/privacy-policy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
    { to: '/disclaimer', label: 'Disclaimer' },
  ],
};

export default function Footer() {
  const location = useLocation();

  // Don't render footer on admin panel
  if (location.pathname.startsWith('/admin')) return null;

  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'calc(var(--bottom-nav-h, 60px) + 0px)',
    }}>
      <div className="container" style={{ padding: '48px 20px 32px' }}>

        {/* Top row: Brand + Link columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 32,
          marginBottom: 40,
        }}>

          {/* Brand block */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #7c3aed 0%, #C8102E 100%)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900, color: 'white',
              }}>D</div>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
                Dream<span style={{ color: 'var(--accent)' }}>Nexa</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 240 }}>
              Free educational platform for Indian students. Discover government jobs, current affairs,
              and compete in live quiz contests.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              <a href="mailto:support@dreamnexa.in" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
                support@dreamnexa.in
              </a>
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <div style={{
                fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--text-muted)', marginBottom: 14,
              }}>
                {heading}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      style={{
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              &copy; {year} DreamNexa. All rights reserved.
              {' '}DreamNexa is an independent educational platform — not affiliated with any government body.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/privacy-policy" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy</Link>
              <Link to="/terms" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms</Link>
              <Link to="/disclaimer" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'underline' }}>Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
