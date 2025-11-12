// src/components/fornecedores/FornecedorForm.tsx
import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';
import type { Fornecedor, FornecedorFormData } from '../../types/Fornecedor';

interface FornecedorFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: FornecedorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const FornecedorForm: React.FC<FornecedorFormProps> = ({
  fornecedor,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FornecedorFormData>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  const [errors, setErrors] = useState<Partial<FornecedorFormData>>({});

  useEffect(() => {
    if (fornecedor) {
      setFormData({
        nome: fornecedor.nome,
        cnpj: fornecedor.cnpj,
        telefone: fornecedor.telefone || '',
        email: fornecedor.email || '',
        endereco: fornecedor.endereco || ''
      });
    }
  }, [fornecedor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FornecedorFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatCNPJ(rawValue);
    
    setFormData(prev => ({
      ...prev,
      cnpj: rawValue
    }));

    if (errors.cnpj) {
      setErrors(prev => ({
        ...prev,
        cnpj: ''
      }));
    }
  };

  // ✅ CORREÇÃO: Aceitar string | undefined
  const formatTelefone = (telefone?: string) => {
    if (!telefone) return '';
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatTelefone(rawValue);
    
    setFormData(prev => ({
      ...prev,
      telefone: rawValue
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FornecedorFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, '')
      };
      
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="card-title mb-0">
          {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Nome/Razão Social *</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  isInvalid={!!errors.nome}
                  placeholder="Digite o nome ou razão social"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nome}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>CNPJ *</Form.Label>
                <Form.Control
                  type="text"
                  name="cnpj"
                  value={formatCNPJ(formData.cnpj)}
                  onChange={handleCnpjChange}
                  isInvalid={!!errors.cnpj}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cnpj}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  type="text"
                  name="telefone"
                  // ✅ CORREÇÃO: Passar string vazia se for undefined
                  value={formatTelefone(formData.telefone)}
                  onChange={handleTelefoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="email@exemplo.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Endereço</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Digite o endereço completo"
            />
          </Form.Group>

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Por favor, corrija os erros antes de salvar.
            </Alert>
          )}

          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="outline-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              <FaTimes className="me-2" />
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
            >
              <FaSave className="me-2" />
              {isLoading ? 'Salvando...' : (fornecedor ? 'Atualizar' : 'Cadastrar')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FornecedorForm;