// src/layouts/ProtectedLayout.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import DashboardLayout from '../layouts/DashboardLayout'; // O componente que acabamos de criar

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    // Redireciona para o login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza o DashboardLayout, que por sua vez renderizará o <Outlet />
  return <DashboardLayout />;
};

export default ProtectedLayout;