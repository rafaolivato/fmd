import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="d-flex">
      {/* Sidebar fixa */}
      <div style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        height: '100vh', 
        width: '250px',
        zIndex: 1000 
      }}>
        <Sidebar />
      </div>
      
      {/* Header fixo */}
      <div style={{ 
        position: 'fixed', 
        left: '250px', 
        top: 0, 
        right: 0, 
        height: '60px',
        zIndex: 999 
      }}>
        <Header />
      </div>

      {/* Conteúdo principal */}
      <main style={{ 
        marginLeft: '250px', 
        marginTop: '60px', 
        width: 'calc(100vw - 250px)',
        minHeight: 'calc(100vh - 60px)',
        padding: '20px',
        backgroundColor: '#f4f7f6'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;