import api from './client';

export const getMyProfile = () =>
  api.get('/api/users/me');

export const getUserProfile = (userId) =>
  api.get(`/api/users/${userId}`);

export const updateProfile = (data) =>
  api.put('/api/users/me', data);

export const changePassword = (data) =>
  api.put('/api/users/me/password', data);

export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/users/me/profile-picture', formData);
};

export const addSkill = (skillId, experienceLevel) =>
  api.post('/api/users/me/skills', { skillId, experienceLevel });

export const removeSkill = (skillId) =>
  api.delete(`/api/users/me/skills/${skillId}`);

export const getMySkills = () =>
  api.get('/api/users/me/skills');
