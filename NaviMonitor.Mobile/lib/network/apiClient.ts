import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`🚨 Backend Rejected Request (${error.response.status}):`);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.warn('📡 Network Error: Make sure your C# API is running and accessible.');
    }
    return Promise.reject(error);
  }
);
