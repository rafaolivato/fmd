// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';

// Páginas
import Login from './pages/Login';
// Crie um componente temporário para a dashboard
const Dashboard = () => <h1>Bem-vindo à Dashboard do FMD!</h1>; 
const NotFound = () => <h1>404 | Página não encontrada</h1>;

// Componente para proteger rotas (PrivateRoutes)
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    // Redireciona para o login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }
  // Renderiza o elemento se estiver autenticado
  return <>{element}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Rota para o Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rota Protegida (Exige login) */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute element={<Dashboard />} />} 
      />
      
      {/* Rota Padrão: Redireciona o root (/) para o login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rota de Erro */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
