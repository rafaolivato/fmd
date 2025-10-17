// fmd-frontend/src/store/slices/estabelecimentoSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../services/api';

// Tipagem básica do Estabelecimento (Ajuste conforme seu modelo)
interface Estabelecimento {
    id: string;
    nome: string;
    cnpj: string | null;
    tipo: string;
}

// Tipagem do Estado
interface EstabelecimentoState {
    estabelecimentos: Estabelecimento[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: EstabelecimentoState = {
    estabelecimentos: [],
    loading: 'idle',
    error: null,
};

interface CreateEstabelecimentoData {
    nome: string;
    cnpj: string;
    tipo: string;
}

interface AxiosError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export const fetchEstabelecimentos = createAsyncThunk<
    Estabelecimento[], // Tipo do retorno de sucesso
    void, // Tipo do argumento de entrada (vazio)
    { rejectValue: string } // Tipo do retorno de erro do rejectWithValue
>(
    'estabelecimentos/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            // 1. RECOLOQUE A CHAMADA REAL À API! (Resolve o aviso 'api is never read')
            const response = await api.get<Estabelecimento[]>('/estabelecimentos');
            return response.data;

        } catch (error) {

            // Use o Type Guard (como você já fez)
            const axiosError = error as AxiosError;

            const message = axiosError.response?.data?.message || 'Falha ao buscar estabelecimentos.';

            return rejectWithValue(message);
        }
    }
);

export const createEstabelecimento = createAsyncThunk<
    Estabelecimento, // Tipo do retorno de sucesso (o objeto criado)
    CreateEstabelecimentoData, // Tipo do payload (dados do formulário)
    { rejectValue: string } // Tipo do retorno de erro
>(
    'estabelecimentos/create',
    async (data, { rejectWithValue }) => {
        try {
            // Faz a chamada POST para o seu backend
            const response = await api.post<Estabelecimento>('/estabelecimentos', data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            const message = axiosError.response?.data?.message || 'Falha ao criar estabelecimento.';
            return rejectWithValue(message);
        }
    }
);

// --- SLICE (Onde o estado é gerenciado) ---
const estabelecimentoSlice = createSlice({
    name: 'estabelecimentos',
    initialState,
    reducers: {
        // Reducer para limpar erros, se necessário
        clearError: (state) => {
            state.error = null;
        }
        // Aqui você adicionaria reducers para manipulação síncrona, se necessário
    },
    extraReducers: (builder) => {
        builder
            // LISTAGEM PENDENTE
            .addCase(fetchEstabelecimentos.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            // LISTAGEM SUCESSO
            .addCase(fetchEstabelecimentos.fulfilled, (state, action: PayloadAction<Estabelecimento[]>) => {
                state.loading = 'succeeded';
                state.estabelecimentos = action.payload; // Armazena a lista
            })
            // LISTAGEM FALHA
            .addCase(fetchEstabelecimentos.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = (action.payload as string) || 'Erro desconhecido ao carregar estabelecimentos.';
                state.estabelecimentos = []; // Limpa a lista em caso de falha
            })

            
            .addCase(createEstabelecimento.pending, (state) => {
                    state.loading = 'pending';
                    state.error = null;
                })
            // CRIAÇÃO SUCESSO (Adiciona o novo item à lista)
            .addCase(createEstabelecimento.fulfilled, (state, action: PayloadAction<Estabelecimento>) => {
                state.loading = 'succeeded';
                // Adiciona o novo item à lista de estabelecimentos existente:
                state.estabelecimentos.push(action.payload);
            })
            // CRIAÇÃO FALHA
            .addCase(createEstabelecimento.rejected, (state, action) => {
                state.loading = 'failed';
                const errorMessage = typeof action.payload === 'string' ? action.payload : 'Erro desconhecido ao criar.';
                state.error = errorMessage;
            });
    },
});

export const { clearError } = estabelecimentoSlice.actions;

export default estabelecimentoSlice.reducer;