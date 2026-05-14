import api from './client';

export const login = (email, password) =>
  api.post('/api/auth/authenticate', { email, password });

export const register = (data) =>
  api.post('/api/auth/register', data);

export const forgotPassword = (email) =>
  api.post('/api/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  api.post('/api/auth/reset-password', { token, newPassword });

export const logout = () =>
  api.post('/api/auth/logout');
