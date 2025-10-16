// src/services/api.ts
import axios from 'axios';

// A URL base do seu backend Express
const BASE_URL = 'http://localhost:3333'; 

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});