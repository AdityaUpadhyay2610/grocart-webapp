import axios from 'axios';
import { auth } from '@global/config/firebaseConfig';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      // Firebase Realtime Database REST API requires 'auth' as a query parameter
      config.params = {
        ...config.params,
        auth: token
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);
