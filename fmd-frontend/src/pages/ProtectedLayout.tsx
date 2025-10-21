import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '../store/store';
import DashboardLayout from '../layouts/DashboardLayout'; 

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    // Redireciona para o login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }

 <Outlet />
  return <DashboardLayout />;
};

export default ProtectedLayout;