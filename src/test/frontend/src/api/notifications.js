import api from './client';

export const getMyNotifications = () =>
  api.get('/api/notifications');

export const deleteNotification = (id) =>
  api.delete(`/api/notifications/${id}`);

export const deleteAllNotifications = () =>
  api.delete('/api/notifications');
