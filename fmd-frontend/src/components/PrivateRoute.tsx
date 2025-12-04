import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'farmaceutico' | 'almoxarife';
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Se não está autenticado
  if (!isAuthenticated || !user) {
    console.log('PrivateRoute: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" />;
  }

  // Se precisa de role específica
  if (requiredRole && user.role !== requiredRole) {
    console.log(`PrivateRoute: Usuário não tem a role necessária. Role do usuário: ${user.role}, Role necessária: ${requiredRole}`);
    return <Navigate to="/dashboard" />;
  }

  console.log('PrivateRoute: Acesso permitido para', user.email);
  return <>{children}</>;
}