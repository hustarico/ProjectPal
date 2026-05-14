import api from './client';

export const submitRating = (rateeId, projectId, score) =>
  api.post('/api/ratings', { rateeId, projectId, score });

export const getUserRatings = (userId) =>
  api.get(`/api/ratings/user/${userId}`);
