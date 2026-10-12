/**
 * NotFound.jsx — 404 page for unknown routes
 */
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        background: 'var(--bg-primary)',
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>🧭</div>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Error 404</div>
      <h1 style={{ marginBottom: 12 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 400, lineHeight: 1.6, marginBottom: 32 }}>
        We couldn't find the page you're looking for. It may have been moved, deleted, or you may have mistyped the URL.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">Go to Home</Link>
        <Link to="/contests" className="btn btn-ghost">Browse Contests</Link>
        <Link to="/help-support" className="btn btn-ghost">Help & Support</Link>
      </div>
    </div>
  );
}
