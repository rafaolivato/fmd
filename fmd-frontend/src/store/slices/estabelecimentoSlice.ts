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
    Estabelecimento[], 
    void, 
    { rejectValue: string } 
>(
    'estabelecimentos/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<Estabelecimento[]>('/estabelecimentos');
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            const message = axiosError.response?.data?.message || 'Falha ao buscar estabelecimentos.';
            return rejectWithValue(message);
        }
    }
);

// 2. CREATE
export const createEstabelecimento = createAsyncThunk<
    Estabelecimento, 
    CreateEstabelecimentoData, 
    { rejectValue: string } 
>(
    'estabelecimentos/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post<Estabelecimento>('/estabelecimentos', data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            const message = axiosError.response?.data?.message || 'Falha ao criar estabelecimento.';
            return rejectWithValue(message);
        }
    }
);

// 3. DELETE (AGORA ESTÁ NO LUGAR CORRETO)
export const deleteEstabelecimento = createAsyncThunk<
    string, // Retorna o ID
    string, // Recebe o ID
    { rejectValue: string } 
>(
    'estabelecimentos/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/estabelecimentos/${id}`);
            return id;
        } catch (error) {
            const axiosError = error as AxiosError;
            const message = axiosError.response?.data?.message || `Falha ao excluir o estabelecimento ID: ${id}.`;
            return rejectWithValue(message);
        }
    }
);


// === SLICE ===
const estabelecimentoSlice = createSlice({
    name: 'estabelecimentos',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- FETCH ---
            .addCase(fetchEstabelecimentos.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchEstabelecimentos.fulfilled, (state, action: PayloadAction<Estabelecimento[]>) => {
                state.loading = 'succeeded';
                state.estabelecimentos = action.payload;
            })
            .addCase(fetchEstabelecimentos.rejected, (state, action) => {
                state.loading = 'failed';
                const errorMessage = typeof action.payload === 'string' ? action.payload : 'Erro desconhecido ao carregar estabelecimentos.';
                state.error = errorMessage;
                state.estabelecimentos = [];
            })

            // --- CREATE ---
            .addCase(createEstabelecimento.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(createEstabelecimento.fulfilled, (state, action: PayloadAction<Estabelecimento>) => {
                state.loading = 'succeeded';
                state.estabelecimentos.push(action.payload);
            })
            .addCase(createEstabelecimento.rejected, (state, action) => {
                state.loading = 'failed';
                const errorMessage = typeof action.payload === 'string' ? action.payload : 'Erro desconhecido ao criar.';
                state.error = errorMessage;
            })
            
            // --- DELETE ---
            .addCase(deleteEstabelecimento.pending, (state) => { // CORRIGIDO: Removido o ponto extra aqui
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(deleteEstabelecimento.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = 'succeeded';
                state.estabelecimentos = state.estabelecimentos.filter(
                    (est) => est.id !== action.payload
                );
            })
            .addCase(deleteEstabelecimento.rejected, (state, action) => {
                state.loading = 'failed';
                const errorMessage = typeof action.payload === 'string' ? action.payload : 'Erro desconhecido ao excluir.';
                state.error = errorMessage;
            }); // CORRIGIDO: Agora tudo está encadeado corretamente
    },
});

export const { clearError } = estabelecimentoSlice.actions;

export default estabelecimentoSlice.reducer;