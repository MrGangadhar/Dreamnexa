import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchCurrentAffairs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_URL}/current-affairs?${query}`);
  return res.data;
};

export const fetchCurrentAffairById = async (id) => {
  const res = await axios.get(`${API_URL}/current-affairs/${id}`);
  return res.data;
};

export const fetchCurrentAffairsCategories = async () => {
  const res = await axios.get(`${API_URL}/current-affairs/categories`);
  return res.data;
};

// Admin API
export const adminFetchCurrentAffairs = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_URL}/current-affairs/admin/all?${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const adminCreateCurrentAffair = async (token, data) => {
  const res = await axios.post(`${API_URL}/current-affairs/admin`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const adminUpdateCurrentAffair = async (token, id, data) => {
  const res = await axios.put(`${API_URL}/current-affairs/admin/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const adminDeleteCurrentAffair = async (token, id) => {
  const res = await axios.delete(`${API_URL}/current-affairs/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
