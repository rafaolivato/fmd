import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaStore, 
  FaArrowLeft, 
  FaUserShield, 
  FaCalendarAlt,
  FaKey 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { authService } from '../store/services/authService';

// Interfaces baseadas nos seus models
interface Estabelecimento {
  id: string;
  nome: string;
  cnes?: string;
  tipo: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Usuario {
  id: string;
  email: string;
  name: string;
  role: string; // 'admin', 'farmaceutico', 'almoxarife'
  estabelecimentoId?: string;
  estabelecimento?: Estabelecimento;
  createdAt?: string;
  updatedAt?: string;
}

// Função auxiliar para formatar a role (tipo de usuário)
const formatRole = (role: string): string => {
  const rolesMap: Record<string, string> = {
    'admin': 'Administrador',
    'farmaceutico': 'Farmacêutico',
    'almoxarife': 'Almoxarife'
  };
  
  return rolesMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
};

// Função auxiliar para formatar o tipo de estabelecimento
const formatTipoEstabelecimento = (tipo: string): string => {
  const tiposMap: Record<string, string> = {
    'ALMOXARIFADO': 'Almoxarifado',
    'FARMACIA_UNIDADE': 'Farmácia Unidade'
  };
  
  return tiposMap[tipo] || tipo;
};

// Função para obter badge color baseado na role
const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    'admin': 'danger',
    'farmaceutico': 'primary',
    'almoxarife': 'success'
  };
  
  return colors[role] || 'secondary';
};

// Função para obter badge color baseado no tipo de estabelecimento
const getTipoEstabelecimentoBadgeColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    'ALMOXARIFADO': 'info',
    'FARMACIA_UNIDADE': 'warning'
  };
  
  return colors[tipo] || 'light';
};

const PerfilPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Obter usuário do storage com tipagem correta
  const usuario: Usuario | null = authService.getUserFromStorage();
  
  // Se não houver usuário, redireciona para login
  if (!usuario) {
    navigate('/login');
    return null;
  }

  // Formatar datas
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Não disponível';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1050,
        overflow: 'auto'
      }}
    >
      <div style={{ 
        maxWidth: '600px', 
        width: '100%',
      }}>
        {/* Botão voltar */}
        <div className="mb-4">
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Voltar
          </Button>
        </div>

        {/* Card principal */}
        <Card className="shadow-lg border-0">
          {/* Cabeçalho */}
          <Card.Header className="bg-primary text-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fw-bold d-flex align-items-center">
                <FaUser className="me-2" />
                Meu Perfil
              </h4>
              </div>
          </Card.Header>
          
          {/* Corpo com informações */}
          <Card.Body className="p-4">
            {/* Seção: Informações Pessoais */}
            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3 text-primary">
                Informações Pessoais
              </h5>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-secondary">Nome completo:</strong>
                    <div className="text-dark mt-1">
                      {usuario.name}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-secondary d-flex align-items-center">
                      <FaEnvelope className="me-2" />
                      Email:
                    </strong>
                    <div className="text-dark mt-1">
                      {usuario.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Perfil de Acesso */}
            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3 text-primary">
                Perfil de Acesso
              </h5>
              
              <div className="mb-3">
                <strong className="text-secondary d-flex align-items-center">
                  <FaUserShield className="me-2" />
                  Função/Perfil:
                </strong>
                <div className="mt-2">
                  <Badge 
                    bg={getRoleBadgeColor(usuario.role)} 
                    className="fs-6 px-3 py-2"
                  >
                    {formatRole(usuario.role)}
                  </Badge>
                </div>
                <small className="text-muted mt-1 d-block">
                  Permissões: {usuario.role === 'admin' ? 'Acesso total' : 
                              usuario.role === 'farmaceutico' ? 'Gestão farmacêutica' : 
                              'Gestão de almoxarifado'}
                </small>
              </div>
            </div>

            {/* Seção: Estabelecimento */}
            {usuario.estabelecimento && (
              <div className="mb-4">
                <h5 className="border-bottom pb-2 mb-3 text-primary">
                  Estabelecimento Vinculado
                </h5>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong className="text-secondary d-flex align-items-center">
                        <FaStore className="me-2" />
                        Nome:
                      </strong>
                      <div className="text-dark mt-1">
                        {usuario.estabelecimento.nome}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong className="text-secondary">Tipo:</strong>
                      <div className="mt-2">
                        <Badge 
                          bg={getTipoEstabelecimentoBadgeColor(usuario.estabelecimento.tipo)} 
                          className="fs-6 px-3 py-2"
                        >
                          {formatTipoEstabelecimento(usuario.estabelecimento.tipo)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                                                              
              </div>
            )}

            {/* Seção: Informações do Sistema */}
            <div>
              <h5 className="border-bottom pb-2 mb-3 text-primary">
                Informações do Sistema
              </h5>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-secondary d-flex align-items-center">
                      <FaCalendarAlt className="me-2" />
                      Cadastrado em:
                    </strong>
                    <div className="text-dark mt-1">
                      {formatDate(usuario.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-secondary d-flex align-items-center">
                      <FaKey className="me-2" />
                      Última atualização:
                    </strong>
                    <div className="text-dark mt-1">
                      {formatDate(usuario.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
         
        </Card>

        {/* Aviso se não tiver estabelecimento vinculado */}
        {!usuario.estabelecimento && (
          <Card className="mt-3 border-warning">
            <Card.Body className="py-3">
              <div className="d-flex align-items-center">
                <FaStore className="text-warning me-2" />
                <div>
                  <strong className="text-warning">Atenção:</strong>
                  <small className="text-muted ms-1">
                    Este usuário não está vinculado a um estabelecimento. Algumas funcionalidades podem estar limitadas.
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PerfilPage;