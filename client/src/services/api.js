import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const matchesApi = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  sync: () => api.post('/matches/sync'),
};

export const predictionsApi = {
  upsert: (data) => api.post('/predictions', data),
  getByMatch: (matchId) => api.get(`/predictions/match/${matchId}`),
  getByUser: (userId) => api.get(`/predictions/user/${userId}`),
};

export const leaderboardApi = {
  get: () => api.get('/leaderboard'),
};

export const standingsApi = {
  get: () => api.get('/standings'),
};

export default api;
