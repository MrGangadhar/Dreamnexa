import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (fallbackUser = null) => {
    try {
      const { data } = await client.get('/users/me');
      setUser(data);
      return data;
    } catch {
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      setLoading(false);
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
    const { data } = await client.post('/auth/login', { usernameOrEmail, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user ?? null);
    await fetchMe(data.user ?? null);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await client.post('/auth/register', payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user ?? null);
    await fetchMe(data.user ?? null);
    return data.user;
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
