import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('calcana_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      const token = localStorage.getItem('calcana_token');
      
      if (token) {
        localStorage.setItem(
          'calcana_logout_reason', 
          'Sua sessão expirou. Por favor, faça login novamente.'
        );

        localStorage.removeItem('calcana_token');

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;