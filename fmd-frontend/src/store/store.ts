// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // Este slice será criado no Passo 3

export const store = configureStore({
  reducer: {
    // 1. Adicione o reducer de autenticação
    auth: authReducer,
    // Futuramente, outros reducers serão adicionados aqui (ex: medicamentos, relatorios)
  },
  // O Redux Toolkit já configura middlewares essenciais
});

// Tipos essenciais para usar o useSelector e useDispatch com TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;