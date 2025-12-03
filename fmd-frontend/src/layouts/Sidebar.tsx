import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


import {
  FaHome,
  FaFileAlt,
  FaSignInAlt,
  FaExchangeAlt,
  FaChartBar,
  FaHospital,
  FaCapsules,
  FaSignOutAlt,
  FaHistory,
  FaUserPlus,
  FaPlus,
  FaList,
  FaTruck,
  FaUserMd,
  FaUsers

} from 'react-icons/fa';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
  adminOnly?: boolean;
}


const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: <FaHome size={16} />,
    path: '/dashboard'
  },
  {
    name: 'Cadastros',
    icon: <FaFileAlt size={16} />,
    path: '#',
    children: [
      {
        name: 'Estabelecimentos',
        icon: <FaHospital size={14} />,
        path: '/estabelecimentos'
      },
      {
        name: 'Medicamentos',
        icon: <FaCapsules size={14} />,
        path: '/medicamentos'
      },
      {
        name: 'Fornecedores',
        icon: <FaTruck size={14} />,
        path: '/fornecedores'
      },
      {
        name: 'Pacientes',
        icon: <FaUserPlus size={14} />,
        path: '/pacientes'
      },
      {
        name: 'Profissionais de Saúde',
        icon: <FaUserMd size={14} />, // Ou <FaStethoscope /> se preferir
        path: '/profissionais-saude'
      },

      {
        name: 'Cadastrar Usuário',
        icon: <FaUsers size={14} />,
        path: '/cadastrar-usuario',
        adminOnly: true // Esta propriedade indica que é apenas para admin
      }
    ]
  },

  {
    name: 'Entrada',
    icon: <FaSignInAlt size={16} />,
    path: '#',
    children: [
      {
        name: 'Entrada', icon: <FaSignInAlt size={14} />,
        path: '/entradas'
      },
      {
        name: 'Histórico', icon: <FaHistory size={14} />,
        path: 'historico'
      }
    ]
  },

  {
    name: 'Movimentação',
    icon: <FaExchangeAlt size={16} />,
    path: '#',
    children: [

      { name: 'Saída', icon: <FaSignOutAlt size={14} />, path: '/saidas' },
      { name: 'Histórico', icon: <FaHistory size={14} />, path: '/movimentacoes' },

    ]
  },
  {
    name: 'Dispensação',
    icon: <FaCapsules size={16} />,
    path: '#',
    children: [
      { name: 'Nova Dispensação', icon: <FaPlus size={14} />, path: '/dispensacao' },
      { name: 'Histórico', icon: <FaHistory size={14} />, path: '/dispensacoes' },
    ]
  },

  {
    name: 'Requisições',
    icon: <FaExchangeAlt size={16} />,
    path: '#',
    children: [
      { name: 'Nova Requisição', icon: <FaPlus size={14} />, path: '/requisicoes/nova' },
      { name: 'Minhas Requisições', icon: <FaList size={14} />, path: '/requisicoes' },

    ]
  },

  {

    name: 'Relatórios',
    icon: <FaChartBar size={16} />,
    path: '/relatorios',
    children: [
      {
        name: 'Posição de Estoque',
        path: '/relatorios/posicao-estoque',
        icon: <FaFileAlt size={14} />
      },

      {
        name: 'Dispensações',
        path: '/relatorios/dispensacoes',
        icon: <FaFileAlt size={14} />
      },
      {
        name: 'Livro de Psicotrópicos',
        path: '/relatorios/livro-psicotropicos',
        icon: <FaFileAlt size={14} />
      },
    ]
  }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const isActive = (path: string) => location.pathname === path;

  // Função para filtrar itens baseado na role do usuário
  const filterItemsByRole = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // Se não é admin e o item tem adminOnly: true, remove
      if (!isAdmin && item.adminOnly) {
        return false;
      }

      // Se tem children, filtra os children também
      if (item.children) {
        const filteredChildren = filterItemsByRole(item.children);
        // Se após filtrar não sobrou nenhum child, remove o item pai também
        if (filteredChildren.length === 0) {
          return false;
        }
        return {
          ...item,
          children: filteredChildren
        };
      }

      return true;
    });
  };

  // Filtra os itens baseado na role
  const filteredNavItems = filterItemsByRole(navItems);

  return (
    <div className="sidebar bg-light border-end" style={{
      width: '250px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto'
    }}>
      <Nav className="flex-column p-3">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="mb-2">
                <Nav.Link
                  as="button"
                  className={`w-100 text-start border-0 bg-transparent d-flex justify-content-between align-items-center ${item.children.some(child => isActive(child.path)) ? 'text-primary' : 'text-dark'
                    }`}
                  onClick={() => toggleExpand(item.name)}
                >
                  <span className="d-flex align-items-center">
                    <span className="me-2">{item.icon}</span>
                    {item.name}
                  </span>
                  <span>{expandedItems.has(item.name) ? '▼' : '►'}</span>
                </Nav.Link>

                {expandedItems.has(item.name) && (
                  <div className="ms-3">
                    {item.children.map((child) => (
                      <Nav.Link
                        key={child.name}
                        as={Link}
                        to={child.path}
                        className={`d-block text-decoration-none py-1 ps-3 ${isActive(child.path) ? 'text-primary fw-bold' : 'text-dark'
                          }`}
                      >
                        <span className="d-flex align-items-center">
                          <span className="me-2">{child.icon}</span>
                          {child.name}
                        </span>
                      </Nav.Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Nav.Link
                as={Link}
                to={item.path}
                className={`mb-2 text-decoration-none ${isActive(item.path) ? 'text-primary fw-bold' : 'text-dark'
                  }`}
              >
                <span className="d-flex align-items-center">
                  <span className="me-2">{item.icon}</span>
                  {item.name}
                </span>
              </Nav.Link>
            )}
          </div>
        ))}
      </Nav>
    </div>
  );
}

export default Sidebar;