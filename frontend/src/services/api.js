import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const wordService = {
  getAllWords: () => api.get('/words'),
  createWord: (data) => api.post('/words', data),
  updateWord: (id, data) => api.put(`/words/${id}`, data),
  deleteWord: (id) => api.delete(`/words/${id}`),
};

export default api;
