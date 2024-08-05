import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Ensure this is set in your environment variables
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ([401, 403].includes(error.response.status) && !originalRequest._retry) {
      console.log("error.response.status");
      console.log(error.response.status);
      console.log("refreshing");
      originalRequest._retry = true;
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) throw new Error('Refresh token not available', { cause: 401 });

        const response = await api.post('/api/refresh', { token: refreshToken });

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
        api.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.accessToken;
        return api(originalRequest);
      } catch (err: any) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

if (typeof window !== 'undefined') {
  api.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
}

export default api;
