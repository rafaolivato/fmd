// src/pages/FornecedoresPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaPlus, FaSign } from 'react-icons/fa';
import FornecedorForm from '../components/fornecedores/FornecedorForm';
import FornecedoresList from '../components/fornecedores/FornecedoresList';
import type { Fornecedor, FornecedorFormData } from '../types/Fornecedor';
import { fornecedorService } from '../store/services/fornecedorService';

const FornecedoresPage: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      setListLoading(true);
      const data = await fornecedorService.getAll();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      alert('Erro ao carregar fornecedores');
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (formData: FornecedorFormData) => {
    try {
      setIsLoading(true);
      
      if (editingFornecedor) {
        await fornecedorService.update(editingFornecedor.id, formData);
        alert('Fornecedor atualizado com sucesso!');
      } else {
        await fornecedorService.create(formData);
        alert('Fornecedor cadastrado com sucesso!');
      }

      await loadFornecedores();
      handleCancel();
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar fornecedor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setShowForm(true);
  };

  const handleDelete = async (fornecedor: Fornecedor) => {
    if (window.confirm(`Tem certeza que deseja excluir "${fornecedor.nome}"?`)) {
      try {
        await fornecedorService.delete(fornecedor.id);
        alert('Fornecedor excluído com sucesso!');
        await loadFornecedores();
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        alert('Erro ao excluir fornecedor');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFornecedor(undefined);
  };

  const handleNewFornecedor = () => {
    setEditingFornecedor(undefined);
    setShowForm(true);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
        <div className="d-flex align-items-center mt-3">
          <FaSign size={32} className="text-primary me-3" />
        <div>
          <h1 className="h2 mb-0">Cadastro de Fornecedores</h1>
          <p className="lead text-muted mb-0">Gerencie os fornecedores do sistema</p>
           </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          {!showForm && (
            <Button variant="primary" onClick={handleNewFornecedor}>
              <FaPlus className="me-2" />
              Novo Fornecedor
            </Button>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          {showForm ? (
            <FornecedorForm
              fornecedor={editingFornecedor}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <FornecedoresList
              fornecedores={fornecedores}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={listLoading}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FornecedoresPage;