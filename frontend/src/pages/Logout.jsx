import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/login');
    };
    performLogout();
  }, [logout, navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '3px solid var(--accent)',
        borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)' }}>Logging you out securely…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
