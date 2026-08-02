import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/contests', label: 'Contests', icon: '🏆' },
  { to: '/news', label: 'News', icon: '📰' },
  { to: '/leaderboard', label: 'Rankings', icon: '📊' },
  { to: '/dashboard', label: 'Profile', icon: '👤', authRequired: true },
];

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <nav className="hide-desktop" style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      height: 'var(--bottom-nav-h)',
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {tabs.filter(t => !t.authRequired || user).map(({ to, label, icon }) => {
        const active = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to);
        return (
          <Link
            key={to} to={to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
      {!user && (
        <Link
          to="/login"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            textDecoration: 'none',
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
          }}
        >
          <span style={{ fontSize: 20 }}>🔑</span>
          <span>Login</span>
        </Link>
      )}
    </nav>
  );
}
