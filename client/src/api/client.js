import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise error messages for the UI.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.details?.join(', ') ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
