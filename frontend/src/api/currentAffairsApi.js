import client from './client';

// ─── Public routes ────────────────────────────────────────────────────────────

export const fetchCurrentAffairs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await client.get(`/current-affairs${query ? `?${query}` : ''}`);
  return res.data;
};

export const fetchCurrentAffairById = async (id) => {
  const res = await client.get(`/current-affairs/${id}`);
  return res.data;
};

export const fetchCurrentAffairsCategories = async () => {
  const res = await client.get('/current-affairs/categories');
  return res.data;
};

// ─── Admin routes (auth token injected automatically by axios interceptor) ────

export const adminFetchCurrentAffairs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await client.get(`/current-affairs/admin/all${query ? `?${query}` : ''}`);
  return res.data;
};

export const adminCreateCurrentAffair = async (data) => {
  const res = await client.post('/current-affairs/admin', data);
  return res.data;
};

export const adminUpdateCurrentAffair = async (id, data) => {
  const res = await client.put(`/current-affairs/admin/${id}`, data);
  return res.data;
};

export const adminDeleteCurrentAffair = async (id) => {
  const res = await client.delete(`/current-affairs/admin/${id}`);
  return res.data;
};
