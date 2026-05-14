import api from './client';

export const createTask = (projectId, data) =>
  api.post(`/api/tasks?projectId=${projectId}`, data);

export const assignTask = (taskId, assigneeId) =>
  api.patch(`/api/tasks/${taskId}/assign`, { assigneeId });

export const updateTaskStatus = (taskId, status) =>
  api.patch(`/api/tasks/${taskId}/status`, { status });

export const editTask = (taskId, data) =>
  api.patch(`/api/tasks/${taskId}`, data);

export const deleteTask = (taskId) =>
  api.delete(`/api/tasks/${taskId}`);

export const getProjectTasks = (projectId) =>
  api.get(`/api/tasks/project/${projectId}`);
