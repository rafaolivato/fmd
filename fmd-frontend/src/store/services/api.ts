import axios from 'axios';

// ✅ CORREÇÃO: Adicione /api na baseURL e use a porta 3333
const BASE_URL = 'http://localhost:3333';  // ← ADICIONE /api AQUI

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

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida de:', response.config.url, response.status); // ← DEBUG
    return response;
  },
  (error) => {
    console.error('❌ Erro na requisição:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Só desloga se for especificamente erro de autenticação
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      // Não redireciona se já está na página de login
      if (currentPath !== '/login' && currentPath !== '/') {
        console.log('Token expirado ou inválido. Redirecionando para login...');
        localStorage.removeItem('@fmd:token');
        localStorage.removeItem('token');
        localStorage.removeItem('@fmd:user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);