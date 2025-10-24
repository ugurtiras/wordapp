import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı localStorage'dan al ve header'a ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - 401 durumunda token'ı temizle
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Login sayfasına yönlendir
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Word services (güncellenmiş)
export const wordService = {
  getAllWords: () => api.get('/words'),
  getWordsByLevel: (level) => api.get(`/words/level/${level}`),
  getUserWords: (userId) => api.get(`/words/user/${userId}`),
  getWord: (id) => api.get(`/words/${id}`),
  createWord: (data) => api.post('/words', data),
  updateWord: (id, data) => api.put(`/words/${id}`, data),
  deleteWord: (id) => api.delete(`/words/${id}`),
};

export default api;
