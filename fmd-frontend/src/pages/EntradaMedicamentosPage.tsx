import React, { useState, useEffect } from 'react';
import EntradaMedicamentosForm from '../components/movimentos/EntradaMedicamentosForm';
import type { MovimentoEntradaFormData } from '../types/MovimentoEntrada';
import type { Medicamento } from '../types/Medicamento';
import type { Estabelecimento } from '../types/Estabelecimento';
import { movimentoEntradaService } from '../store/services/movimentoEntradaService';
import { medicamentoService } from '../store/services/medicamentoService';
import { estabelecimentoService } from '../store/services/estabelecimentoService';
import { authService } from '../store/services/authService';

const EntradaMedicamentosPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null); // 
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      
      // ✅ Carrega usuário logado primeiro
      const userData = await authService.getCurrentUser();
      setUsuarioLogado(userData);
      
      const [medsData, estsData] = await Promise.all([
        medicamentoService.getAll(),
        estabelecimentoService.getAll()
      ]);
      setMedicamentos(medsData);
      setEstabelecimentos(estsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar medicamentos e estabelecimentos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (formData: MovimentoEntradaFormData) => {
    try {
      setIsLoading(true);
      
      // ✅ VALIDAÇÃO: Verifica se o estabelecimento selecionado é o mesmo do usuário logado
      if (formData.estabelecimentoId !== usuarioLogado?.estabelecimentoId) {
        alert('Você só pode registrar entrada no seu próprio estabelecimento');
        return;
      }
      
      await movimentoEntradaService.create(formData);
      alert('Entrada de medicamentos registrada com sucesso!');
      // Limpar formulário ou redirecionar se quiser
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      alert(error instanceof Error ? error.message : 'Erro ao registrar entrada');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (isLoadingData) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // ✅ Se não tem usuário logado, mostra erro
  if (!usuarioLogado) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          <h4>Erro de Autenticação</h4>
          <p>Usuário não autenticado. Faça login novamente.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          
          
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <EntradaMedicamentosForm
            estabelecimentos={estabelecimentos.filter(est => 
              est.id === usuarioLogado.estabelecimentoId // ✅ Filtra apenas o estabelecimento do usuário
            )}
            medicamentos={medicamentos}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default EntradaMedicamentosPage;