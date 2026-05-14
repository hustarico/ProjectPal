import { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await usersApi.getMyProfile();
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    await fetchUser();
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    await fetchUser();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = () => fetchUser();

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
