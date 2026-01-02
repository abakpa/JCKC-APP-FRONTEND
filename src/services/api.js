import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Children API
export const childrenAPI = {
  getAll: (params) => api.get('/children', { params }),
  getById: (id) => api.get(`/children/${id}`),
  search: (params) => api.get('/children/search', { params }),
  register: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
  uploadPhoto: (id, formData) => api.post(`/children/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByClass: (classId) => api.get(`/children/class/${classId}`),
  getByGroup: (groupId) => api.get(`/children/group/${groupId}`),
};

// Classes API
export const classesAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  assignTeacher: (id, teacherId) => api.post(`/classes/${id}/assign-teacher`, { teacherId }),
  removeTeacher: (id, teacherId) => api.post(`/classes/${id}/remove-teacher`, { teacherId }),
  initialize: () => api.post('/classes/init'),
};

// Groups API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  assignTeacher: (id, teacherId) => api.post(`/groups/${id}/assign-teacher`, { teacherId }),
  removeTeacher: (id, teacherId) => api.post(`/groups/${id}/remove-teacher`, { teacherId }),
  addChild: (id, childId) => api.post(`/groups/${id}/add-child`, { childId }),
  removeChild: (id, childId) => api.post(`/groups/${id}/remove-child`, { childId }),
  initialize: () => api.post('/groups/init'),
};

// Sessions API
export const sessionsAPI = {
  getAll: () => api.get('/sessions'),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  assignTeacher: (id, teacherId) => api.post(`/sessions/${id}/assign-teacher`, { teacherId }),
  removeTeacher: (id, teacherId) => api.post(`/sessions/${id}/remove-teacher`, { teacherId }),
  initialize: () => api.post('/sessions/init'),
};

// Attendance API
export const attendanceAPI = {
  takeClass: (data) => api.post('/attendance/class', data),
  takeGroup: (data) => api.post('/attendance/group', data),
  getById: (id) => api.get(`/attendance/${id}`),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  getClassHistory: (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
  getGroupHistory: (groupId, params) => api.get(`/attendance/group/${groupId}`, { params }),
  getChildHistory: (childId, params) => api.get(`/attendance/child/${childId}`, { params }),
  getReport: (params) => api.get('/attendance/report', { params }),
};

// Teachers API
export const teachersAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  getParents: () => api.get('/teachers/parents'),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  send: (data) => api.post('/notifications', data),
  sendBulk: (data) => api.post('/notifications/bulk', data),
};

export default api;
