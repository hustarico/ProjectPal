import api from './client';

export const sendInvite = (projectId, receiverId) =>
  api.post('/api/invitations/invite', { projectId, receiverId });

export const requestToJoin = (projectId) =>
  api.post(`/api/invitations/join-request?projectId=${projectId}`);

export const respondToInvitation = (invitationId, accept) =>
  api.patch(`/api/invitations/${invitationId}/respond`, { accept });

export const getMyInvites = () =>
  api.get('/api/invitations/my');

export const getJoinRequests = (projectId) =>
  api.get(`/api/invitations/join-requests/${projectId}`);
