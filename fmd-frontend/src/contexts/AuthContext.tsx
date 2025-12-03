import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';

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

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // Se já tem dados no localStorage, mas não no Redux, sincroniza
  React.useEffect(() => {
    const storagedUser = localStorage.getItem('@fmd:user');
    const storagedToken = localStorage.getItem('@fmd:token');
    
    if (storagedUser && storagedToken && !user) {
      dispatch(setCredentials({
        user: JSON.parse(storagedUser),
        token: storagedToken
      }));
    }
  }, [dispatch, user]);

  async function signIn(email: string, password: string) {
    // Você vai precisar adaptar esta função para usar sua API
    // Vou deixar um exemplo genérico
    try {
      const response = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        dispatch(setCredentials({
          user: data.user,
          token: data.token
        }));
        
        localStorage.setItem('@fmd:user', JSON.stringify(data.user));
        localStorage.setItem('@fmd:token', data.token);
      } else {
        throw new Error(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      throw error;
    }
  }

  function signOut() {
    dispatch(clearCredentials());
    localStorage.removeItem('@fmd:user');
    localStorage.removeItem('@fmd:token');
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: false, // Pode ajustar se tiver loading no Redux
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}