import api from './client';

export const createProject = (data) =>
  api.post('/api/projects', data);

export const updateProject = (projectId, data) =>
  api.patch(`/api/projects/${projectId}`, data);

export const deleteProject = (projectId) =>
  api.delete(`/api/projects/${projectId}`);

export const getProject = (projectId) =>
  api.get(`/api/projects/${projectId}`);

export const getMyProjects = () =>
  api.get('/api/projects/my');

export const browseProjects = () =>
  api.get('/api/projects/browse');

export const getProjectMembers = (projectId) =>
  api.get(`/api/projects/${projectId}/members`);

export const updateMemberRole = (projectId, userId, memberRole) =>
  api.patch(`/api/projects/${projectId}/members/${userId}/role`, { memberRole });
