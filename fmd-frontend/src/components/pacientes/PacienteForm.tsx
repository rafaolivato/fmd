// src/components/pacientes/PacienteForm.tsx
import React, { useState } from 'react';
import { Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import type { Paciente, PacienteFormData } from '../../types/Paciente';

interface PacienteFormProps {
  paciente?: Paciente;
  onSubmit: (data: PacienteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PacienteForm: React.FC<PacienteFormProps> = ({
  paciente,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<PacienteFormData>({
    nome: '',
    cpf: '',
    dataNascimento: '',
    endereco: ''
  });

  const [errors, setErrors] = useState<Partial<PacienteFormData>>({});

  React.useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome,
        cpf: paciente.cpf,
        dataNascimento: paciente.dataNascimento.split('T')[0],
        endereco: paciente.endereco || ''
      });
    }
  }, [paciente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof PacienteFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedCpf = formatCPF(rawValue);
    
    setFormData(prev => ({
      ...prev,
      cpf: rawValue // ✅ GUARDA O CPF SEM FORMATAÇÃO
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PacienteFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // ✅ CORREÇÃO: Garantir que o CPF está sem formatação
      const dataToSubmit = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, '')
      };
      
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="card-title mb-0">
          {paciente ? 'Editar Paciente' : 'Novo Paciente'}
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Nome Completo *</Form.Label>
                <Form.Control
                  type="text"
                  className={errors.nome ? 'is-invalid' : ''}
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome completo"
                />
                {errors.nome && (
                  <div className="invalid-feedback">{errors.nome}</div>
                )}
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>CPF *</Form.Label>
                <Form.Control
                  type="text"
                  className={errors.cpf ? 'is-invalid' : ''}
                  name="cpf"
                  value={formatCPF(formData.cpf)} // ✅ EXIBE FORMATADO
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && (
                  <div className="invalid-feedback">{errors.cpf}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data de Nascimento *</Form.Label>
                <Form.Control
                  type="date"
                  className={errors.dataNascimento ? 'is-invalid' : ''}
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                />
                {errors.dataNascimento && (
                  <div className="invalid-feedback">{errors.dataNascimento}</div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Endereço</Form.Label>
                <Form.Control
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Endereço completo"
                />
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="info" className="small">
            <strong>💡 Dica:</strong> Após cadastrar o paciente, você poderá 
            buscá-lo pelo CPF na tela de dispensação.
          </Alert>

          <div className="d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {paciente ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                paciente ? 'Atualizar' : 'Cadastrar Paciente'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PacienteForm;