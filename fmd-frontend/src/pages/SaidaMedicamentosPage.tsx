import React, { useState, useEffect } from 'react';
import SaidaMedicamentosForm from '../components/movimentos/SaidaMedicamentosForm';
import type { MovimentoSaidaFormData } from '../types/MovimentoSaida';
import type { Medicamento } from '../types/Medicamento';
import type { Estabelecimento } from '../types/Estabelecimento';
import { movimentoSaidaService } from '../store/services/movimentoSaidaService';
import { medicamentoService } from '../store/services/medicamentoService';
import { estabelecimentoService } from '../store/services/estabelecimentoService';
import { authService } from '../store/services/authService';


const SaidaMedicamentosPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
  
      const userData = await authService.getCurrentUser();
      setUsuarioLogado(userData);
  
      if (!userData?.estabelecimentoId) {
        throw new Error('Usuário não autenticado ou sem estabelecimento definido');
      }
  
      // ✅ ORDEM CORRETA - certifique-se que está nesta ordem
      const [medsData, estsData] = await Promise.all([
        medicamentoService.getComEstoquePorEstabelecimento(userData.estabelecimentoId), // ← Medicamento[]
        estabelecimentoService.getAll(), // ← Estabelecimento[]
             
      ]);
  
      // ✅ ATRIBUIÇÃO CORRETA
      setMedicamentos(medsData); // Medicamento[] vai para medicamentos
      
     
  
      // ✅ CORREÇÃO: Agora filtrando estsData (que é Estabelecimento[])
      let estabelecimentosFiltrados: Estabelecimento[] = [];
  
      if (userData && userData.estabelecimentoId) {
        estabelecimentosFiltrados = estsData.filter(
          (est) => est.id === userData.estabelecimentoId
        );
      }
  
      setEstabelecimentos(estabelecimentosFiltrados);
  
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar medicamentos e estabelecimentos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (formData: MovimentoSaidaFormData) => {
    try {
            
      setIsLoading(true);

      if (formData.estabelecimentoId !== usuarioLogado?.estabelecimentoId) {
        alert('Você só pode registrar entrada no seu próprio estabelecimento');
        return;
      }

      await movimentoSaidaService.create(formData);
      if (formData.itens.length === 0) {
        alert('Erro: Nenhum item foi adicionado à saída');
        return;
      }
      alert('Saída de medicamentos registrada com sucesso!');
      // Recarregar medicamentos para atualizar estoque
      await loadData();
    } catch (error) {
      
    
      console.error('Erro ao registrar saída:', error);
      alert(error instanceof Error ? error.message : 'Erro ao registrar saída');
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

  return (
    <div className="container-fluid">
      <div className="row mb-4">

      </div>

      <div className="row">
        <div className="col-12">
          <SaidaMedicamentosForm
            estabelecimentos={estabelecimentos}
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

export default SaidaMedicamentosPage;