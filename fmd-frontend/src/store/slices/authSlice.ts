// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from './../services/api';

export interface IAuthResponse {
  token: string;
  usuarioId: string;
  nome: string;
  role: 'ADMIN' | 'FARMACEUTICO' | 'PACIENTE'; 
}

// O estado que o slice irá gerenciar
interface AuthState {
  data: IAuthResponse | null;
  isAuthenticated: boolean;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  data: null,
  isAuthenticated: false,
  loading: 'idle',
  error: null,
};

// Thunk Assíncrono para fazer login
// O 'credentials' deve ter a estrutura que seu backend espera (ex: { email: string, senha: string })
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      // Endpoint que você deve ter criado no seu backend Express
      const response = await api.post('/login', credentials); 
      
      const authData: IAuthResponse = response.data;

      // Persiste o token para manter o usuário logado após refresh
      localStorage.setItem('fmd_token', authData.token); 
      
      // Configura o cabeçalho 'Authorization' para todas as futuras requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;

      return authData; 
    } catch (err: any) {
      // Retorna a mensagem de erro do backend ou uma mensagem padrão
      return rejectWithValue(err.response?.data?.message || 'Credenciais inválidas. Verifique seu usuário e senha.');
    }
  }
);

// Thunk para carregar token do localStorage e restaurar sessão (útil no início da aplicação)
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    const token = localStorage.getItem('fmd_token');
    if (token) {
      // Tenta usar o token. Idealmente, você teria um endpoint como '/auth/me' para validar.
      // Por enquanto, apenas o colocamos no cabeçalho do Axios.
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Você precisaria de um endpoint para buscar os dados do usuário com base no token
      // Como não temos esse endpoint, faremos apenas a simulação de que o token é válido
      // dispatch(restoreSession({ token: token, ... dados fictícios }));
      // Este passo é complexo sem o backend completo, então vamos focar apenas no Login/Logout por enquanto.
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Ação para fazer logout
    logout: (state) => {
      state.data = null;
      state.isAuthenticated = false;
      state.loading = 'idle';
      state.error = null;
      localStorage.removeItem('fmd_token');
      delete api.defaults.headers.common['Authorization']; // Remove o token do Axios
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN PENDING
      .addCase(loginUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      // LOGIN SUCESSO
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<IAuthResponse>) => {
        state.loading = 'succeeded';
        state.isAuthenticated = true;
        state.data = action.payload; 
        state.error = null;
      })
      // LOGIN FALHA
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.isAuthenticated = false;
        state.data = null;
        state.error = action.payload as string; 
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;