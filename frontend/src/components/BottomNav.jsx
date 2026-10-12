import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* SVG icons — cleaner than emoji for a real app feel */
const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" strokeWidth="1.8" />
  </svg>
);
const TrophyIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
    <path d="M6 9H3l2 8h14l2-8h-3" />
    <path d="M9 3h6v6a3 3 0 1 1-6 0V3z" fill={active ? 'currentColor' : 'none'} />
    <path d="M12 15v4M8 19h8" />
  </svg>
);
const NewsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" fill={active ? 'currentColor' : 'none'} />
    <path d="M7 8h10M7 12h10M7 16h6" stroke={active ? '#fff' : 'currentColor'} />
  </svg>
);
const LeaderIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="14" width="4" height="8" rx="1" fill={active ? 'currentColor' : 'none'} />
    <rect x="10" y="9" width="4" height="13" rx="1" fill={active ? 'currentColor' : 'none'} />
    <rect x="18" y="5" width="4" height="17" rx="1" fill={active ? 'currentColor' : 'none'} />
  </svg>
);
const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const tabs = [
  { to: '/',           label: 'Home',     Icon: HomeIcon   },
  { to: '/contests',   label: 'Contests', Icon: TrophyIcon },
  { to: '/news',       label: 'News',     Icon: NewsIcon   },
  { to: '/leaderboard',label: 'Ranks',    Icon: LeaderIcon },
  { to: '/dashboard',  label: 'Profile',  Icon: ProfileIcon, authRequired: true },
];

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  const visibleTabs = tabs.filter(t => !t.authRequired || user);

  return (
    <>
      {/* Safe-area spacer so content doesn't hide behind nav */}
      <nav
        className="hide-desktop"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 200,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          height: 62,
          display: 'flex',
          alignItems: 'stretch',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {visibleTabs.map(({ to, label, Icon }) => {
          const active = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                textDecoration: 'none',
                color: active ? '#C8102E' : '#9ca3af',
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.02em',
                position: 'relative',
                transition: 'color 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 6,
                  width: 28,
                  height: 3,
                  borderRadius: 3,
                  background: '#C8102E',
                }} />
              )}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 8,
                background: active ? 'rgba(200,16,46,0.08)' : 'transparent',
                transition: 'background 0.15s',
                marginTop: 2,
              }}>
                <Icon active={active} />
              </span>
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
              gap: 3,
              textDecoration: 'none',
              color: '#C8102E',
              fontSize: 10,
              fontWeight: 700,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ fontSize: 22 }}>🔑</span>
            <span>Login</span>
          </Link>
        )}
      </nav>
    </>
  );
}
