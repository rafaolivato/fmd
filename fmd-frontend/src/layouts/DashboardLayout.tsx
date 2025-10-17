import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout: React.FC = () => {
  return (
    <>
      <Sidebar />
      <Header />
      
      {/* A área principal do conteúdo */}
      <div 
        style={{ 
          marginLeft: '250px', // Espaço reservado para a Sidebar fixa
          
          padding: '20px', // Espaçamento interno para o conteúdo
          minHeight: '100vh',
          backgroundColor: '#f4f7f6', // Um fundo claro para o conteúdo
        }}
      >
        {/* O Outlet renderiza o componente aninhado (ex: DashboardHome, EntradasPage) */}
        <Outlet />
      </div>
    </>
  );
};

export default DashboardLayout;