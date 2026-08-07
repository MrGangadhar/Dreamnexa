/**
 * SidebarNav.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full professional sidebar drawer navigation.
 * Opens via hamburger in Navbar; includes all menu items from the spec.
 * Closes on backdrop click, Escape key, or link navigation.
 */

import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiBriefcase, FiRadio, FiBook, FiCheckSquare, FiTarget,
  FiTrendingUp, FiAward, FiCreditCard, FiRepeat, FiBell, FiBookmark,
  FiUser, FiStar, FiHelpCircle, FiSettings, FiLogOut, FiX,
} from 'react-icons/fi';

const MENU_SECTIONS = [
  {
    title: 'Main',
    items: [
      { to: '/dashboard',   icon: FiHome,        label: 'Dashboard' },
      { to: '/jobs',        icon: FiBriefcase,   label: 'Latest Government Jobs' },
      { to: '/news',        icon: FiRadio,       label: 'Latest News', isNew: true },
      { to: '/current-affairs', icon: FiBook,    label: 'Current Affairs' },
    ],
  },
  {
    title: 'Compete',
    items: [
      { to: '/quiz',        icon: FiCheckSquare, label: 'Daily Quiz' },
      { to: '/contests',    icon: FiTarget,      label: 'Mock Tests' },
      { to: '/contests',    icon: FiTrendingUp,  label: 'Contest' },
      { to: '/leaderboard', icon: FiAward,       label: 'Leaderboard' },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/wallet',       icon: FiCreditCard,  label: 'My Wallet' },
      { to: '/transactions', icon: FiRepeat,      label: 'Transactions' },
      { to: '/notifications',icon: FiBell,        label: 'Notifications' },
      { to: '/bookmarks',    icon: FiBookmark,    label: 'Bookmarks' },
      { to: '/profile',      icon: FiUser,        label: 'Profile' },
      { to: '/subscription', icon: FiStar,        label: 'Subscription' },
    ],
  },
  {
    title: 'Support',
    items: [
      { to: '/help',     icon: FiHelpCircle, label: 'Help & Support' },
      { to: '/settings', icon: FiSettings,   label: 'Settings' },
    ],
  },
];

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden:  { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 280 } },
  exit:    { x: '-100%', transition: { duration: 0.25 } },
};

/**
 * @param {boolean}  isOpen   — controlled open state
 * @param {Function} onClose  — close callback
 */
export default function SidebarNav({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="sidebar-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="sidebar-nav"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
          >
            {/* Header */}
            <div className="sidebar-header">
              <Link to="/" className="sidebar-brand" onClick={onClose}>
                <div className="sidebar-brand-icon">Q</div>
                <span className="sidebar-brand-name">
                  Quiz<span style={{ color: 'var(--accent)' }}>Arena</span>
                </span>
              </Link>
              <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
                <FiX size={14} />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  {(user.full_name || user.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div className="sidebar-user-name">
                    {user.full_name || user.username}
                  </div>
                  <div className="sidebar-user-pts">
                    {(user.total_points ?? 0).toLocaleString()} Points
                  </div>
                </div>
              </div>
            )}

            {/* Menu sections */}
            <nav className="sidebar-menu">
              {MENU_SECTIONS.map((section) => (
                <div key={section.title}>
                  <div className="sidebar-section-title">{section.title}</div>
                  {section.items.map(({ to, icon: Icon, label, isNew }) => (
                    <Link
                      key={`${to}-${label}`}
                      to={to}
                      className={`sidebar-item ${location.pathname === to ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Icon className="sidebar-item-icon" />
                      {label}
                      {isNew && <span className="sidebar-item-new">NEW</span>}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Admin Access */}
              {user?.role === 'admin' && (
                <div>
                  <div className="sidebar-section-title">Admin</div>
                  <Link
                    to="/admin"
                    className={`sidebar-item ${location.pathname === '/admin' ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <FiSettings className="sidebar-item-icon" />
                    Admin Control Room
                  </Link>
                </div>
              )}

              {/* Logout */}
              {user && (
                <div>
                  <div className="sidebar-section-title"> </div>
                  <button className="sidebar-item" onClick={handleLogout}>
                    <FiLogOut className="sidebar-item-icon" style={{ color: 'var(--accent)' }} />
                    <span style={{ color: 'var(--accent)' }}>Logout</span>
                  </button>
                </div>
              )}
            </nav>

            {/* Footer */}
            {!user && (
              <div className="sidebar-footer">
                <Link to="/login" className="btn btn-ghost btn-full" onClick={onClose} style={{ marginBottom: 8 }}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-full" onClick={onClose}>
                  Join Free
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
