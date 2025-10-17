// src/App.tsx (VERSÃO ATUALIZADA)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// import { useSelector } from 'react-redux'; // Não precisa mais aqui

// Componentes
import Login from './pages/Login';
import ProtectedLayout from './pages/ProtectedLayout'; 
import EstabelecimentoPage from './pages/EstabelecimentoPage';

// Páginas (Mude para o nome correto depois)
const DashboardHome = () => <h1>Bem-vindo à Dashboard do FMD!</h1>; 
//const Cadastros = () => <h1>Página de Cadastros</h1>;
const Entradas = () => <h1>Página de Entradas</h1>;

const NotFound = () => <h1>404 | Página não encontrada</h1>;


const App: React.FC = () => {
  return (
    <Routes>
      {/* Rota pública de Login */}
      <Route path="/login" element={<Login />} />
      
      {/* ---------------------------------------------------- */}
      {/* ROTA PROTEGIDA COM LAYOUT ANINHADO */}
      {/* O elemento ProtectedLayout (que contém o DashboardLayout) será renderizado */}
      <Route path="/" element={<ProtectedLayout />}>
        
        {/* Rota padrão: / */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Rotas operacionais que aparecerão dentro do <Outlet /> do DashboardLayout */}
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="cadastros" element={<EstabelecimentoPage />} />
        <Route path="entradas" element={<Entradas />} />
        
        {/* Você continuará adicionando aqui: /movimentacoes, /dispensacao, etc. */}
      </Route>
      {/* ---------------------------------------------------- */}

      {/* Rota de Erro (Geral) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;