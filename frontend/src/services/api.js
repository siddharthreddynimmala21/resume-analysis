import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (email) => {
  const response = await api.post('/api/auth/register', { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/api/auth/verify-otp', { email, otp });
  return response.data;
};

export const setupPassword = async (email, otp, password) => {
  const response = await api.post('/api/auth/setup-password', { email, otp, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post('/api/auth/resend-otp', { email });
  return response.data;
};

export const sendMessage = async (prompt) => {
  try {
    const response = await api.post('/api/chat', { prompt });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
