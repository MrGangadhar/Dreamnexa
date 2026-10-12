import api from './client';

export const proctoringApi = {
  submitConsent: (contestId, payload) =>
    api.post(`/proctoring/${contestId}/consent`, payload).then((res) => res.data),

  submitSystemCheck: (contestId, payload) =>
    api.post(`/proctoring/${contestId}/system-check`, payload).then((res) => res.data),

  reportEvent: (contestId, payload) =>
    api.post(`/proctoring/${contestId}/events`, payload).then((res) => res.data),

  getState: (contestId) =>
    api.get(`/proctoring/${contestId}/state`).then((res) => res.data),

  // Admin
  listSessions: (flagged = true) =>
    api.get(`/admin/proctoring/sessions${flagged ? '?flagged=1' : ''}`).then((res) => res.data),

  getSessionDetail: (sessionId) =>
    api.get(`/admin/proctoring/sessions/${sessionId}`).then((res) => res.data),

  resolveReview: (sessionId, decision) =>
    api.post(`/admin/proctoring/sessions/${sessionId}/decision`, { decision }).then((res) => res.data),
};
