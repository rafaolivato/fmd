export interface EstabelecimentoUser {
  id: string;
  nome: string;
  tipo: string; // Mantém como string para compatibilidade
  cnpj?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  estabelecimentoId?: string;
  estabelecimento?: EstabelecimentoUser;
}

// Tipo auxiliar para verificação de almoxarifado
export const isAlmoxarifado = (user: User): boolean => {
  return user.estabelecimento?.tipo === 'ALMOXARIFADO';
};

export const isFarmacia = (user: User): boolean => {
  return user.estabelecimento?.tipo === 'FARMACIA_UNIDADE';
};