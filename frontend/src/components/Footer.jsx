/**
 * Footer.jsx — Site-wide footer for DreamNexa
 *
 * Google AdSense reviewers check that Privacy Policy, Terms, Contact,
 * About, and Disclaimer pages are easily discoverable.
 *
 * Excluded from:
 *   - /admin routes (admin panel has its own shell)
 *   - /play or test taking routes (focus mode / zero distractions / no ads)
 */

import { Link, useLocation } from 'react-router-dom';
import '../styles/footer.css';

const FOOTER_LINKS = {
  'Quick Links': [
    { to: '/government-jobs', label: 'Govt Jobs' },
    { to: '/current-affairs', label: 'Current Affairs' },
    { to: '/news', label: 'News & Updates' },
    { to: '/contests', label: 'Quiz Contests' },
    { to: '/leaderboard', label: 'Top 10 Ranks' },
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

  // Don't render footer on admin panel or during quiz/test taking
  if (location.pathname.startsWith('/admin') || location.pathname.includes('/play')) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* Top row: Brand + Link columns */}
        <div className="footer-main-grid">

          {/* Brand column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand-title">
              <div className="footer-brand-logo">D</div>
              <span className="footer-brand-name">
                Dream<span style={{ color: 'var(--accent)' }}>Nexa</span>
              </span>
            </Link>
            <p className="footer-brand-desc">
              Educational portal for Indian aspirants. Discover verified government job notifications, daily current affairs &amp; GK, and participate in competitive quiz challenges.
            </p>
            <div>
              <a href="mailto:meetmrgangadhar@gmail.com" className="footer-contact-link">
                meetmrgangadhar@gmail.com
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="footer-links-col">
              <div className="footer-col-heading">
                {heading}
              </div>
              <ul className="footer-links-list">
                {links.map(({ to, label }) => (
                  <li key={to} className="footer-link-item">
                    <Link to={to}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider / Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            &copy; {year} DreamNexa. All rights reserved. Independent educational platform — not affiliated with any government agency.
          </p>
          <div className="footer-legal-links">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
