import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handling wrapper
const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  throw new Error(message);
};

// User-related API calls
export const userApi = {
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/users/logout');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/current');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Complaint-related API calls
export const complaintApi = {
  createComplaint: async (complaintData) => {
    try {
      const response = await api.post('/complaints', complaintData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getAllComplaints: async () => {
    try {
      const response = await api.get('/complaints');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getComplaintById: async (id) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getUserComplaints: async () => {
    try {
      const response = await api.get('/complaints/user/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateComplaintStatus: async (id, status) => {
    try {
      const response = await api.put(`/complaints/${id}/status`, { status });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteComplaint: async (id) => {
    try {
      const response = await api.delete(`/complaints/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};