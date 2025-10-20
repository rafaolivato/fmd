import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedLayout from './pages/ProtectedLayout'; 
import EstabelecimentoPage from './pages/EstabelecimentoPage';
import MedicamentosPage from './pages/MedicamentosPage';

// Páginas
const DashboardHome = () => <h1>Bem-vindo à Dashboard do FMD!</h1>;
const Entradas = () => <h1>Página de Entradas</h1>;
const NotFound = () => <h1>404 | Página não encontrada</h1>;

const App: React.FC = () => {
  return (
    <Routes>
      {/* Rota pública de Login */}
      <Route path="/login" element={<Login />} />
      
      {/* ROTA PROTEGIDA COM LAYOUT ANINHADO */}
      <Route path="/" element={<ProtectedLayout />}>
        
        {/* Rota padrão: / */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Rotas dentro do ProtectedLayout */}
        <Route path="dashboard" element={<DashboardHome />} />
        
        {/* Rota CORRIGIDA para Estabelecimentos */}
        <Route path="estabelecimentos" element={<EstabelecimentoPage />} />
        
        {/* Rota CORRIGIDA para Medicamentos */}
        <Route path="medicamentos" element={<MedicamentosPage />} />
        
        <Route path="entradas" element={<Entradas />} />
        
        {/* Adicione outras rotas aqui */}
      </Route>

      {/* Rota de Erro (Geral) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;