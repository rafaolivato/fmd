import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedLayout from './pages/ProtectedLayout';
import EstabelecimentoPage from './pages/EstabelecimentoPage';
import MedicamentosPage from './pages/MedicamentosPage';
import EntradaMedicamentosPage from './pages/EntradaMedicamentosPage';
import SaidaMedicamentosPage from './pages/SaidaMedicamentosPage';
import MovimentosPage from './pages/MovimentosPage';
import DispensacaoPage from './pages/DispensacaoPage';
import PacientesPage from './pages/PacientesPage';
import DispensacoesPage from './pages/DispensacoesPage';
import NovaRequisicaoPage from './pages/NovaRequisicaoPage';
import RequisicoesPage from './pages/RequisicoesPage';
import PerfilPage from './pages/PerfilPage';
import FornecedoresPage from './pages/FornecedoresPage';
import DashboardHome from './pages/DashboardHome';
import MovimentoDetailsPage from './pages/MovimentoDetailsPage';
import HistoricoEntradas from './pages/HistoricoEntradas';
import RelatoriosPage from './pages/relatorios/RelatoriosPage';
import PosicaoEstoquePage from './pages/relatorios/PosicaoEstoquePage';
import RelatorioDispensacoesPage from './pages/relatorios/RelatorioDispensacaoPage';
import ProfissionaisSaudePage from './pages/ProfissionaisSaudePage';
import PsicotropicosPage from './pages/relatorios/PsicotropicosPage';
import CadastroUsuario from './pages/Admin/CadastroUsuarios';
import { PrivateRoute } from './components/PrivateRoute';


const NotFound = () => <h1>404 | Página não encontrada</h1>;

const App: React.FC = () => {
  return (
    <Routes>
      {/* Rota pública de Login */}
      <Route path="/login" element={<Login />} />

      <Route path="/perfil" element={<PerfilPage />} />

      {/* ROTA PROTEGIDA COM LAYOUT ANINHADO */}
      <Route path="/" element={<ProtectedLayout />}>

        {/* Rota padrão: / */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Rotas dentro do ProtectedLayout */}
        <Route path="dashboard" element={<DashboardHome />} />

        <Route
          path="estabelecimentos"
          element={
            <PrivateRoute requiredRole="admin">
              <EstabelecimentoPage />
            </PrivateRoute>
          }
        />

        <Route path="medicamentos" element={<MedicamentosPage />} />

        <Route path="fornecedores" element={<FornecedoresPage />} />

        <Route path="entradas" element={<EntradaMedicamentosPage />} />

        <Route path="saidas" element={<SaidaMedicamentosPage />} />

        <Route path="movimentacoes" element={<MovimentosPage />} />

        <Route path="movimentacoes/:id" element={<MovimentoDetailsPage />} />

        <Route path="dispensacao" element={<DispensacaoPage />} />

        <Route path="pacientes" element={<PacientesPage />} />

        <Route path="dispensacoes" element={<DispensacoesPage />} />

        <Route path="requisicoes/nova" element={<NovaRequisicaoPage />} />

        <Route path="requisicoes" element={<RequisicoesPage />} />

        <Route path="historico" element={<HistoricoEntradas />} />

        <Route path="/relatorios" element={<RelatoriosPage />} />

        <Route path="/relatorios/posicao-estoque" element={<PosicaoEstoquePage />} />

        <Route path="/relatorios/dispensacoes" element={<RelatorioDispensacoesPage />} />

        <Route path="profissionais-saude" element={<ProfissionaisSaudePage />} />

        <Route path="/relatorios/livro-psicotropicos" element={<PsicotropicosPage />} />

        <Route path="cadastrar-usuario" element={<CadastroUsuario />} />

        {/* Adicione outras rotas aqui */}
      </Route>

      {/* Rota de Erro (Geral) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;