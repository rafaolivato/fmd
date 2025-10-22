// src/components/dashboard/AlertasEstoque.tsx
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import type { AlertaEstoque } from '../../types/AlertaEstoque';
import { alertaService } from '../../store/services/alertaService';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

const AlertasEstoque: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlertas = async () => {
    try {
      setIsLoading(true);
      const data = await alertaService.getAlertasEstoque();
      setAlertas(data);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlertas();
  }, []);

  const getNivelAlerta = (alerta: AlertaEstoque) => {
    const percentual = (alerta.estoqueAtual / alerta.estoqueMinimo) * 100;
    if (percentual <= 20) return 'danger';
    if (percentual <= 50) return 'warning';
    return 'info';
  };

  const getTextoAlerta = (alerta: AlertaEstoque) => {
    const percentual = (alerta.estoqueAtual / alerta.estoqueMinimo) * 100;
    if (percentual <= 20) return 'Estoque Crítico';
    if (percentual <= 50) return 'Estoque Baixo';
    return 'Atenção ao Estoque';
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Header className="bg-warning text-dark">
          <FaExclamationTriangle className="me-2" />
          Alertas de Estoque
        </Card.Header>
        <Card.Body className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <small className="ms-2">Carregando alertas...</small>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
        <span>
          <FaExclamationTriangle className="me-2" />
          Alertas de Estoque
        </span>
        <Button variant="outline-dark" size="sm" onClick={loadAlertas}>
          <FaSync />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        {alertas.length === 0 ? (
          <div className="text-center py-4">
            <FaExclamationTriangle size={32} className="text-success mb-2" />
            <p className="text-muted mb-0">Estoque em dia! 🎉</p>
            <small className="text-muted">Nenhum alerta no momento</small>
          </div>
        ) : (
          <ListGroup variant="flush">
            {alertas.map((alerta, index) => (
              <ListGroup.Item key={index} className="py-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">{alerta.principioAtivo}</h6>
                    <small className="text-muted">{alerta.concentracao}</small>
                  </div>
                  <Badge bg={getNivelAlerta(alerta)}>
                    {getTextoAlerta(alerta)}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small>
                    Estoque: <strong>{alerta.estoqueAtual}</strong> / Mín: {alerta.estoqueMinimo}
                  </small>
                  <small className="text-muted">{alerta.estabelecimento}</small>
                </div>
                {/* Barra de progresso visual */}
                <div className="progress mt-2" style={{ height: '6px' }}>
                  <div 
                    className={`progress-bar bg-${getNivelAlerta(alerta)}`}
                    style={{ 
                      width: `${Math.min(100, (alerta.estoqueAtual / alerta.estoqueMinimo) * 100)}%` 
                    }}
                  ></div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default AlertasEstoque;