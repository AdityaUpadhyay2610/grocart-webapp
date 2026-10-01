// src/global/utils/axiosInstance.ts
// Central HTTP client for the GroCart web application.
// Handles baseURL, withCredentials, in-memory JWT access token management,
// automatic 401 token refresh, and de-duplicated session restoration.

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { appConfig } from '@global/config/appConfig';

// In-memory access token storage (never saved to localStorage or Redux)
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const apiClient = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Single in-flight promise for refresh calls to prevent token rotation race conditions
let refreshPromise: Promise<any> | null = null;

/**
 * Shared de-duplicated refresh session helper.
 * Reuses active in-flight refresh promise so multiple callers (e.g. StrictMode, App + StorefrontApp)
 * share exactly ONE call to POST /auth/refresh.
 */
export const refreshSession = async (): Promise<any> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // Use raw axios instance or direct call to avoid response interceptor loop
      const response = await axios.post(
        `${appConfig.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const data = response.data?.data;
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
      }
      return data;
    } catch (err) {
      setAccessToken(null);
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Request interceptor: Attach in-memory access token to Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: On 401 (excluding /auth/* routes), attempt refresh once and retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't intercept auth routes (e.g. login, register, refresh) to avoid infinite loops
    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshData = await refreshSession();
        if (refreshData?.accessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh failed: session expired, clear token and reject
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
