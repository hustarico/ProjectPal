import api from './client';

export const listSkills = () =>
  api.get('/api/skills');

export const createSkill = (name) =>
  api.post('/api/skills', { name });

export const addSkillToSelf = (skillId, experienceLevel) =>
  api.post('/api/skills/user', { skillId, experienceLevel });

export const removeSkillFromSelf = (skillId) =>
  api.delete(`/api/skills/user/${skillId}`);

export const getUserSkills = (userId) =>
  api.get(`/api/skills/user/${userId}`);
