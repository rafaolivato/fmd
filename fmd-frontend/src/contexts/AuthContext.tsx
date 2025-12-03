import  { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { api } from '../store/services/api';

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

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega dados do localStorage ao inicializar
    const loadStoredData = async () => {
      const storagedUser = localStorage.getItem('@fmd:user');
      const storagedToken = localStorage.getItem('@fmd:token');
      
      if (storagedUser && storagedToken) {
        setUser(JSON.parse(storagedUser));
        // Configura o token na API
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`;
      }
      
      setLoading(false);
    };
    
    loadStoredData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Ajuste a URL conforme sua API
      const response = await api.post('/auth/login', { email, password });
      
      const { user: userData, token } = response.data;
      
      // Atualiza estado
      setUser(userData);
      
      // Salva no localStorage
      localStorage.setItem('@fmd:user', JSON.stringify(userData));
      localStorage.setItem('@fmd:token', token);
      
      // Configura token na API
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('@fmd:user');
    localStorage.removeItem('@fmd:token');
    delete api.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook separado para resolver o erro do ESLint
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Se não quiser usar o hook separado, comente a linha abaixo
// export default AuthProvider;