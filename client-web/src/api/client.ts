import axios from 'axios';

export const API_BASE_URL = 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('uniconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('uniconnect_token');
      localStorage.removeItem('uniconnect_user');
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi máy chủ'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định';
}
