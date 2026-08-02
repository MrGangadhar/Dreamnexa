/**
 * Navbar.jsx — QuizArena top navigation bar
 * ─────────────────────────────────────────────────────────────────────────────
 * Includes:
 *   - Logo + brand
 *   - Desktop nav links (Contests, News, Leaderboard, Dashboard)
 *   - Hamburger button → opens SidebarNav drawer (full menu)
 *   - User points badge + avatar
 *   - Auth action buttons
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiRadio } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import SidebarNav from './news/SidebarNav';

const NAV_LINKS = [
  { to: '/contests',  label: 'Contests' },
  { to: '/news',      label: 'News', isNew: true },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        height: 'var(--nav-height)',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}>
          {/* Hamburger (left side) */}
          <button
            id="nav-hamburger"
            onClick={() => setSidebarOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36,
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--bg-raised)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              flexShrink: 0,
              marginRight: 12,
            }}
            aria-label="Open menu"
          >
            <FiMenu size={18} />
          </button>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--accent)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: 'white',
            }}>Q</div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: 20,
              color: 'var(--text-primary)',
            }}>
              Quiz<span style={{ color: 'var(--accent)' }}>Arena</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 24, flex: 1 }}>
            {NAV_LINKS.map(({ to, label, isNew }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontWeight: 500, fontSize: 15,
                  color: location.pathname.startsWith(to) ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'color 0.2s',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 5,
                  position: 'relative',
                }}
              >
                {to === '/news' && <FiRadio size={14} />}
                {label}
                {isNew && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 5px',
                    background: 'var(--accent)', color: '#fff',
                    borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>NEW</span>
                )}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard" style={{
                fontWeight: 500, fontSize: 15,
                color: location.pathname === '/dashboard' ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'color 0.2s', textDecoration: 'none',
              }}>My Profile</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" style={{
                fontWeight: 500, fontSize: 15,
                color: location.pathname === '/admin' ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
              }}>Admin</Link>
            )}
          </nav>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user ? (
              <>
                {/* Points Badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--accent-yellow-soft)',
                  border: '1px solid rgba(245, 166, 35, 0.3)',
                  borderRadius: 20, padding: '4px 12px', cursor: 'default',
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#b37300' }}>
                    {(user.total_points ?? 0).toLocaleString()}{' '}
                    <span style={{ fontSize: 11, fontWeight: 600 }}>PTS</span>
                  </span>
                </div>

                {/* Avatar + Logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32, height: 32,
                      borderRadius: '50%',
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 14,
                      color: 'var(--text-primary)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                    title={user.full_name || user.username}
                    onClick={() => navigate('/dashboard')}
                  >
                    {(user.full_name || user.username || 'U')[0].toUpperCase()}
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="btn btn-ghost btn-sm hide-mobile"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm hide-mobile">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Full sidebar drawer */}
      <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
