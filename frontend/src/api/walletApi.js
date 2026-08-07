import api from './client';

export const walletApi = {
  getSummary: () => api.get('/wallet').then((res) => res.data),
  
  getPointsHistory: () => api.get('/wallet/history').then((res) => res.data),
  
  getPrizeHistory: () => api.get('/wallet/prize-history').then((res) => res.data),
  
  getWithdrawHistory: () => api.get('/wallet/withdraw-history').then((res) => res.data),
  
  withdraw: (payload) => api.post('/wallet/withdraw', payload).then((res) => res.data),
};
