// src/global/config/appConfig.js
// The only place in the frontend that reads import.meta.env for the backend API URL.

export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL || '/api'
};
