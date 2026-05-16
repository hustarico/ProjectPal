import api from '../src/api/client';

export const getAdminStats = () =>
  api.get('/api/admin/stats');

export const getAdminUsers = () =>
  api.get('/api/admin/users');

export const toggleUserStatus = (userId) =>
  api.patch(`/api/admin/users/${userId}/status`);

export const promoteToAdmin = (userId) =>
  api.patch(`/api/admin/users/${userId}/role`);

export const getAdminProjects = () =>
  api.get('/api/admin/projects');

export const toggleProjectStatus = (projectId) =>
  api.patch(`/api/admin/projects/${projectId}/status`);

export const deleteSkill = (skillId) =>
  api.delete(`/api/skills/${skillId}`);
