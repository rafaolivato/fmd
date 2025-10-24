import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  estabelecimentoId?: string;
  estabelecimento?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private storageKey = '@fmd:user';
  private tokenKey = '@fmd:token';

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/sessions', {
        email,
        password
      });

      const { user, token } = response.data;

      // Salva no localStorage
      this.setUser(user);
      this.setToken(token);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Tenta buscar da API primeiro (mais atualizado)
      const response = await api.get<User>('/users/me'); // MUDEI: /users/me em vez de /usuarios/me
      if (response.data) {
        this.setUser(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.log('Não foi possível buscar usuário da API, usando cache...');
      // Se não conseguir da API, usa o localStorage
      return this.getUserFromStorage();
    }
  }

  setUser(user: User): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    // Atualiza o header da API
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(this.storageKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erro ao recuperar usuário do storage:', error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Método específico para o NovaRequisicaoForm
  getUsuarioLogadoParaRequisicao() {
    const user = this.getUserFromStorage();
    if (!user) return null;

    return {
      id: user.id,
      estabelecimentoId: user.estabelecimentoId,
      estabelecimentoNome: user.estabelecimento?.nome || 'Meu Estabelecimento'
    };
  }
}

export const authService = new AuthService();