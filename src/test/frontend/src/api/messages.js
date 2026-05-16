import api from './client';

export const sendMessage = (projectId, content) =>
  api.post(`/api/messages/project/${projectId}`, {
    content,
    fileUrl: null,
    fileName: null
  });

export const getMessageHistory = (projectId) =>
  api.get(`/api/messages/project/${projectId}`);

export const deleteMessage = (messageId) =>
  api.delete(`/api/messages/${messageId}`);
