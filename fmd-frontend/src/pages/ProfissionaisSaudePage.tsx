import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Form, 
  Modal,
  Alert,
  InputGroup
} from 'react-bootstrap';
import { FaUser, FaUserPlus, FaSearch, FaEdit, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { type ProfissionalSaude } from '../types/ProfissionalSaude';
import { profissionalSaudeService } from '../store/services/profissionalSaudeService';

const ProfissionaisSaudePage: React.FC = () => {
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState<ProfissionalSaude[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentProfissional, setCurrentProfissional] = useState<Partial<ProfissionalSaude>>({
    nome: '',
    crm: ''
  });

  const loadProfissionais = async () => {
    setLoading(true);
    try {
      const data = await profissionalSaudeService.getAll();
      setProfissionais(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfissionais();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      if (currentProfissional.id) {
        // Atualizar
        await profissionalSaudeService.update(currentProfissional.id, currentProfissional);
        setSuccess('Profissional atualizado com sucesso!');
      } else {
        // Criar nov
        await profissionalSaudeService.create(currentProfissional as Omit<ProfissionalSaude, 'id' | 'createdAt' | 'updatedAt'>);
        setSuccess('Profissional cadastrado com sucesso!');
      }
      
      setShowModal(false);
      setCurrentProfissional({ nome: '', crm: '' });
      loadProfissionais();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (profissional: ProfissionalSaude) => {
    setCurrentProfissional(profissional);
    setShowModal(true);
  };

  const handleNew = () => {
    setCurrentProfissional({ nome: '', crm: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProfissional({ nome: '', crm: '' });
    setError('');
  };

  const filteredProfissionais = profissionais.filter(profissional =>
    profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.crm?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUser className="me-3" size={30} />
              <div>
                <h1 className="h3 mb-0">Profissionais de Saúde</h1>
                <p className="text-muted mb-0">Cadastro e gerenciamento de profissionais</p>
              </div>
            </div>
            <Button 
              variant="primary" 
              onClick={handleNew}
              className="d-flex align-items-center"
            >
              <FaUserPlus className="me-2" />
              Novo Profissional
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <p></p>
            <Form.Control
              type="text"
              placeholder="Buscar por nome ou CRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                minWidth: '300px'
              }}
            />
          </InputGroup>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 mb-0">Carregando profissionais...</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CRM/Registro</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfissionais.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      {profissionais.length === 0 
                        ? 'Nenhum profissional cadastrado' 
                        : 'Nenhum profissional encontrado na busca'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredProfissionais.map((profissional) => (
                    <tr key={profissional.id}>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <FaUser className="me-2 text-muted" />
                          {profissional.nome}
                        </div>
                      </td>
                      <td className="align-middle">
                        {profissional.crm || (
                          <span className="text-muted">Não informado</span>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(profissional)}
                          className="me-1"
                        >
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal para cadastro/edição */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            {currentProfissional.id ? 'Editar Profissional' : 'Novo Profissional'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Profissional *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome completo"
                value={currentProfissional.nome}
                onChange={(e) => setCurrentProfissional({ 
                  ...currentProfissional, 
                  nome: e.target.value 
                })}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>CRM/Registro Profissional</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o número do registro"
                value={currentProfissional.crm || ''}
                onChange={(e) => setCurrentProfissional({ 
                  ...currentProfissional, 
                  crm: e.target.value 
                })}
              />
              <Form.Text className="text-muted">
                Opcional - para médicos, dentistas, etc.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              <FaTimes className="me-1" />
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Salvando...</span>
                  </span>
                  Salvando...
                </>
              ) : (
                <>
                  {currentProfissional.id ? 'Atualizar' : 'Cadastrar'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProfissionaisSaudePage;