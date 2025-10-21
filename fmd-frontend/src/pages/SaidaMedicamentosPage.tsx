// src/pages/SaidaMedicamentosPage.tsx
import React, { useState, useEffect } from 'react';
import SaidaMedicamentosForm from '../components/movimentos/SaidaMedicamentosForm';
import type { MovimentoSaidaFormData } from '../types/MovimentoSaida';
import type  { Medicamento } from '../types/Medicamento';
import type { Estabelecimento } from '../types/Estabelecimento';
import { movimentoSaidaService } from '../store/services/movimentoSaidaService';
import { medicamentoService } from '../store/services/medicamentoService';
import { estabelecimentoService } from '../store/services/estabelecimentoService';

const SaidaMedicamentosPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
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

  const handleSubmit = async (formData: MovimentoSaidaFormData) => {
    try {
     console.log('🔍 DEBUG - formData completo:', formData);
    console.log('🔍 DEBUG - itens:', formData.itens);
    console.log('🔍 DEBUG - número de itens:', formData.itens.length);
      setIsLoading(true);
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
        <div className="col">
          <h1>Saída de Medicamentos</h1>
          <p className="lead">Registre a saída de medicamentos do estoque</p>
        </div>
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