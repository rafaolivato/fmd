// fmd-frontend/src/components/Sidebar.tsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  icon: string; // Usaremos emojis ou ícones reais (se instalados)
  path: string;
}

// Definição das funcionalidades do FMD
const navItems: NavItem[] = [
  { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { name: 'Cadastros', icon: '📝', path: '/cadastros' }, // Vamos agrupar as rotas aqui
  { name: 'Entrada (Recebimento)', icon: '📥', path: '/entradas' },
  { name: 'Movimentação', icon: '🔄', path: '/movimentacoes' },
  { name: 'Dispensação', icon: '📤', path: '/dispensacao' },
  { name: 'Relatórios', icon: '📊', path: '/relatorios' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div 
      style={{ 
        width: '250px', 
        height: '100vh', 
        position: 'fixed', 
        top: 0, 
        left: 0,
        backgroundColor: '#343a40', // Cor de fundo escura do Bootstrap (dark)
        color: 'white',
        paddingTop: '60px', // Espaço para o header (se for fixo)
        overflowY: 'auto', // Permite scroll se o menu for muito grande
      }}
    >
      <Nav className="flex-column p-2">
        <h4 className="text-center mb-4" style={{ color: '#fff' }}>FMD Admin</h4>
        
        {navItems.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link 
              as={Link} // Usa o Link do React Router
              to={item.path}
              // Marca o item ativo (usa location.pathname para checar)
              active={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))}
              className="text-white"
              style={{ 
                borderRadius: '5px',
                transition: 'background-color 0.2s',
              }}
            >
              <span style={{ marginRight: '10px' }}>{item.icon}</span>
              {item.name}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;