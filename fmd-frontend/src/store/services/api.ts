import axios from 'axios';

const BASE_URL = 'http://localhost:3333';  

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('@fmd:token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida de:', response.config.url, response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('❌ ERRO COMPLETO na requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data, // ← Isso é importante!
      headers: error.config?.headers,
      errorMessage: error.message
    });
    
    // Mostra o erro específico do backend, se houver
    if (error.response?.data) {
      console.error('📋 Erro do backend:', error.response.data);
    }
    
    // Só desloga se for especificamente erro de autenticação
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      if (currentPath !== '/login' && currentPath !== '/') {
        console.log('Token expirado ou inválido. Redirecionando para login...');
        localStorage.removeItem('@fmd:token');
        localStorage.removeItem('@fmd:user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);