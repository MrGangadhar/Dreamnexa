import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  // Track in-flight login/register to keep loading=true until nav happens
  const authInProgress = useRef(false);

  const fetchMe = useCallback(async (fallbackUser = null) => {
    try {
      const { data } = await client.get('/users/me');
      setUser(data);
      return data;
    } catch {
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      if (!authInProgress.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = async (usernameOrEmail, password) => {
    authInProgress.current = true;
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', { usernameOrEmail, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      // Set user immediately from login response so ProtectedRoute sees it right away
      const resolvedUser = data.user ?? null;
      setUser(resolvedUser);
      // Best-effort refresh from /me, but don't block navigation
      client.get('/users/me').then(({ data: me }) => setUser(me)).catch(() => {});
      return resolvedUser;
    } finally {
      authInProgress.current = false;
      setLoading(false);
    }
  };

  const register = async (payload) => {
    authInProgress.current = true;
    setLoading(true);
    try {
      const { data } = await client.post('/auth/register', payload);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const resolvedUser = data.user ?? null;
      setUser(resolvedUser);
      client.get('/users/me').then(({ data: me }) => setUser(me)).catch(() => {});
      return resolvedUser;
    } finally {
      authInProgress.current = false;
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { await client.post('/auth/logout', { refreshToken }); } catch { /* ignore */ }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
