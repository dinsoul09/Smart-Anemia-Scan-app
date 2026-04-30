import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthEventEmitter, refreshTokenApi } from './authApi';

const API_URL = 'https://api-anemiascan.ru';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A flag to prevent multiple token refresh requests at the same time
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let refreshToken = null;
        if (Platform.OS === 'web') {
          refreshToken = localStorage.getItem('refreshToken');
        } else {
          refreshToken = await SecureStore.getItemAsync('refreshToken');
        }

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const newTokens = await refreshTokenApi(refreshToken);
        const newAccessToken = newTokens.tokenRecord.accessToken;
        const newRefreshToken = newTokens.tokenRecord.refreshToken;

        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        } else {
          await SecureStore.setItemAsync('userToken', newAccessToken);
          if (newRefreshToken) await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Log out user
        if (Platform.OS === 'web') {
          localStorage.removeItem('userToken');
          localStorage.removeItem('refreshToken');
        } else {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('refreshToken');
        }
        AuthEventEmitter.emit();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
