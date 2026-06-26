import axios from 'axios';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/features/auth/constants';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

export interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}
