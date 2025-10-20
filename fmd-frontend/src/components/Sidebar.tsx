// fmd-frontend/src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  icon: string;
  path: string;
  children?: NavItem[]; // Para subitens
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { 
    name: 'Cadastros', 
    icon: '📝', 
    path: '#',
    children: [
      { name: 'Estabelecimentos', icon: '🏥', path: '/estabelecimentos' },
      { name: 'Medicamentos', icon: '💊', path: '/medicamentos' },
      // Você pode adicionar outros cadastros aqui depois
    ]
  },
  { name: 'Entrada (Recebimento)', icon: '📥', path: '/entradas' },
  { name: 'Movimentação', icon: '🔄', path: '/movimentacoes' },
  { name: 'Dispensação', icon: '📤', path: '/dispensacao' },
  { name: 'Relatórios', icon: '📊', path: '/relatorios' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  return (
    <div className="sidebar bg-light border-end" style={{ width: '250px', minHeight: '100vh' }}>
      <Nav className="flex-column p-3">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.children ? (
              // Item com submenu
              <div className="mb-2">
                <Nav.Link
                  as="button"
                  className={`w-100 text-start border-0 bg-transparent d-flex justify-content-between align-items-center ${
                    item.children.some(child => isActive(child.path)) ? 'text-primary' : 'text-dark'
                  }`}
                  onClick={() => toggleExpand(item.name)}
                >
                  <span>
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
                        className={`d-block text-decoration-none py-1 ps-3 ${
                          isActive(child.path) ? 'text-primary fw-bold' : 'text-dark'
                        }`}
                      >
                        <span className="me-2">{child.icon}</span>
                        {child.name}
                      </Nav.Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Item sem submenu
              <Nav.Link
                as={Link}
                to={item.path}
                className={`mb-2 text-decoration-none ${
                  isActive(item.path) ? 'text-primary fw-bold' : 'text-dark'
                }`}
              >
                <span className="me-2">{item.icon}</span>
                {item.name}
              </Nav.Link>
            )}
          </div>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;