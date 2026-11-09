import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const TOKEN_STORAGE_KEY = 'uniconnect_admin_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi, vui lòng thử lại') {
  if (axios.isAxiosError(error)) {
    const apiErr = error.response?.data?.error;
    if (apiErr?.message) return String(apiErr.message);
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
