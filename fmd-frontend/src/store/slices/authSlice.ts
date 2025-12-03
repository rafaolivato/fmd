import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from './../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  estabelecimentoId?: string | null;
  estabelecimento?: {
    id: string;
    nome: string;
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: 'idle',
  error: null,
  isAuthenticated: false,
};

// Thunk para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🔐 Enviando login para:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      console.log('✅ Resposta da API:', {
        status: response.status,
        data: response.data,
        keys: Object.keys(response.data)
      });
      
      // Debug: Mostra a estrutura completa
      if (response.data.user) {
        console.log('👤 Estrutura do user:', Object.keys(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro no login:', error.response?.data);
      return rejectWithValue(error.response?.data?.error || 'Erro ao fazer login');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = 'succeeded';
      
      // Salva no localStorage
      localStorage.setItem('@fmd:user', JSON.stringify(action.payload.user));
      localStorage.setItem('@fmd:token', action.payload.token);
      console.log('💾 Credenciais salvas no localStorage');
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = 'idle';
      state.error = null;
      
      // Remove do localStorage
      localStorage.removeItem('@fmd:user');
      localStorage.removeItem('@fmd:token');
      localStorage.removeItem('token');
      console.log('🧹 Credenciais removidas do localStorage');
    },
    // Nova action para restaurar do localStorage
    restoreCredentials: (state) => {
      const userStr = localStorage.getItem('@fmd:user');
      const token = localStorage.getItem('@fmd:token');
      
      if (userStr && token) {
        try {
          state.user = JSON.parse(userStr);
          state.token = token;
          state.isAuthenticated = true;
          console.log('🔄 Credenciais restauradas do localStorage');
        } catch (error) {
          console.error('Erro ao restaurar credenciais:', error);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        console.log('⏳ Login pendente...');
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('🎉 Login bem-sucedido!');
        
        // IMPORTANTE: Verifica se a estrutura está correta
        if (!action.payload.user || !action.payload.token) {
          console.error('❌ Estrutura inesperada do payload:', action.payload);
          state.loading = 'failed';
          state.error = 'Estrutura de resposta inválida';
          return;
        }
        
        state.loading = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        
        // SALVA NO LOCALSTORAGE
        localStorage.setItem('@fmd:user', JSON.stringify(action.payload.user));
        localStorage.setItem('@fmd:token', action.payload.token);
        
        console.log('💾 Dados salvos no localStorage:', {
          email: action.payload.user.email,
          role: action.payload.user.role,
          tokenLength: action.payload.token.length
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.isAuthenticated = false;
        console.error('💥 Login rejeitado:', action.payload);
      });
  },
});

export const { setCredentials, clearCredentials, restoreCredentials } = authSlice.actions;
export default authSlice.reducer;