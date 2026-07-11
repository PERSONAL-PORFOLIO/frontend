import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — but NOT for the login endpoint itself
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// ── Services ────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const profileService = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

export const skillService = {
  getAll: () => api.get('/skills'),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
};

export const experienceService = {
  getAll: () => api.get('/experiences'),
  create: (data) => api.post('/experiences', data),
  update: (id, data) => api.put(`/experiences/${id}`, data),
  delete: (id) => api.delete(`/experiences/${id}`),
};

export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const educationService = {
  getAll: () => api.get('/education'),
  create: (data) => api.post('/education', data),
  update: (id, data) => api.put(`/education/${id}`, data),
  delete: (id) => api.delete(`/education/${id}`),
};

export const certificateService = {
  getAll: () => api.get('/certificates'),
  create: (data) => api.post('/certificates', data),
  update: (id, data) => api.put(`/certificates/${id}`, data),
  delete: (id) => api.delete(`/certificates/${id}`),
};

export const uploadService = {
  // Do NOT set Content-Type manually — axios auto-sets multipart/form-data
  // with the correct boundary when passed a FormData instance.
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData);
  },
};

export const contactService = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  getOne: (id) => api.get(`/contact/${id}`),
  unreadCount: () => api.get('/contact/unread-count'),
  markRead: (id) => api.patch(`/contact/${id}/read`),
  reply: (id, data) => api.post(`/contact/${id}/reply`, data),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const settingsService = {
  getPublic: () => api.get('/settings'), // public (no auth)
  getAdmin: () => api.get('/settings/admin'), // protected
  update: (data) => api.put('/settings', data), // protected
};

export const aiService = {
  chat: (messages) => api.post('/ai/chat', { messages }),
};

export const postService = {
  getAll: (params) => api.get('/posts', { params }),
  getOne: (slug) => api.get(`/posts/${slug}`),
  getAdmin: () => api.get('/posts/admin/all'),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};
