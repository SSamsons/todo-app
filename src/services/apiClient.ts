import axios, { type InternalAxiosRequestConfig } from 'axios';
import { readToken } from './tokenStorage';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error instanceof Error ? error : new Error('request failed'));
    }

    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url = config.url ?? '';
    const isAuthCall = url.includes('/login') || url.includes('/refresh') || url.includes('/register');

    if (!error.response && !config._retry && !isAuthCall) {
      config._retry = true;
      return api.request(config);
    }

    if (error.response?.status === 401 && !config._retry && !isAuthCall) {
      config._retry = true;
      const { refreshSession } = await import('./authService');
      const next = await refreshSession();
      if (next) {
        config.headers.Authorization = `Bearer ${next.token}`;
        return api.request(config);
      }
    }

    return Promise.reject(error);
  },
);

export { api };
