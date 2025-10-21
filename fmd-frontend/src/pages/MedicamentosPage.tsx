import React, { useState, useEffect } from 'react';
import MedicamentoForm from '../components/medicamentos/MedicamentoForm';
import MedicamentoList from '../components/medicamentos/MedicamentoList';
import type { Medicamento, MedicamentoFormData } from '../types/Medicamento';


import { medicamentoService } from '../store/services/medicamentoService';

const MedicamentosPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicamento, setEditingMedicamento] = useState<Medicamento | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    try {
      setListLoading(true);
      const data = await medicamentoService.getAll();
      setMedicamentos(data);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
      alert('Erro ao carregar medicamentos');
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (formData: MedicamentoFormData) => {
    try {
      setIsLoading(true);
      
      if (editingMedicamento) {
        await medicamentoService.update(editingMedicamento.id!, formData);
        alert('Medicamento atualizado com sucesso!');
      } else {
        await medicamentoService.create(formData);
        alert('Medicamento cadastrado com sucesso!');
      }
  
      await loadMedicamentos();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (medicamento: Medicamento) => {
    setEditingMedicamento(medicamento);
    setShowForm(true);
  };

  const handleDelete = async (medicamento: Medicamento) => {
    if (window.confirm(`Tem certeza que deseja excluir "${medicamento.principioAtivo}"?`)) {
      try {
        await medicamentoService.delete(medicamento.id!);
        await loadMedicamentos();
        alert('Medicamento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir medicamento:', error);
        alert(error instanceof Error ? error.message : 'Erro ao excluir medicamento');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedicamento(undefined);
  };

  const handleNewMedicamento = () => {
    setEditingMedicamento(undefined);
    setShowForm(true);
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <p></p>
          <h2>Cadastro de Medicamentos</h2>
          <p className="lead">Gerencie os medicamentos do sistema</p>
        </div>
        <p></p>
        <div className="col-auto">
          {!showForm && (
            
            <button
              className="btn btn-primary"
              onClick={handleNewMedicamento}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Novo Medicamento
            </button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {showForm ? (
            <MedicamentoForm
              medicamento={editingMedicamento}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <MedicamentoList
              medicamentos={medicamentos}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={listLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicamentosPage;