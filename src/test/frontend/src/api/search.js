import api from './client';

export const searchUsersByName = (name) =>
  api.get(`/api/search/users?name=${encodeURIComponent(name)}`);

export const searchUsersBySkill = (skillId, experienceLevel) => {
  let url = `/api/search/users/skill?skillId=${skillId}`;
  if (experienceLevel) url += `&experienceLevel=${experienceLevel}`;
  return api.get(url);
};

export const recommendUsers = (skillIds) =>
  api.get(`/api/search/users/recommend?skillIds=${skillIds.join(',')}`);

export const advancedSearch = (params) => {
  const query = new URLSearchParams();
  if (params.name) query.set('name', params.name);
  if (params.skillIds?.length) query.set('skillIds', params.skillIds.join(','));
  return api.get(`/api/search/users/advanced?${query.toString()}`);
};

export const searchProjects = (name) => {
  const query = name ? `?name=${encodeURIComponent(name)}` : '';
  return api.get(`/api/search/projects${query}`);
};
