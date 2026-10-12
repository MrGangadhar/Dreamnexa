import client from './client';

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

// Admin API
export const adminFetchCurrentAffairs = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await client.get(`/current-affairs/admin/all${query ? `?${query}` : ''}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};

export const adminCreateCurrentAffair = async (token, data) => {
  const res = await client.post('/current-affairs/admin', data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};

export const adminUpdateCurrentAffair = async (token, id, data) => {
  const res = await client.put(`/current-affairs/admin/${id}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};

export const adminDeleteCurrentAffair = async (token, id) => {
  const res = await client.delete(`/current-affairs/admin/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};
