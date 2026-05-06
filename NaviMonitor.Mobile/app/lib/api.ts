import { create } from 'axios';
import { auth } from '../lib/firebase';

const BASE_URL = 'http://192.168.68.104:5053/api'; 

const api = create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Auth Interceptor Error:", error);
  }
  return config;
});

export default api;
