// useFornecedores.ts
import { useState, useEffect } from 'react';
import { fornecedorService } from '../store/services/fornecedorService';
import type { Movimento } from '../types/Movimento';

export const useFornecedores = (movimentos: Movimento[]) => {
  const [fornecedores, setFornecedores] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFornecedores = async () => {
      // Coleta IDs únicos de fornecedores
      const fornecedorIds = [...new Set(
        movimentos
          .filter(m => m.fornecedorId)
          .map(m => m.fornecedorId!)
      )];

      // Filtra apenas os que ainda não foram carregados
      const idsParaCarregar = fornecedorIds.filter(id => !fornecedores[id]);

      if (idsParaCarregar.length === 0) return;

      setIsLoading(true);

      try {
        const fornecedorMap: {[key: string]: string} = {};
        const promises = idsParaCarregar.map(id =>
          fornecedorService.getFornecedorNomeById(id)
            .then(nome => {
              fornecedorMap[id] = nome;
            })
            .catch(() => {
              fornecedorMap[id] = 'Fornecedor não encontrado';
            })
        );

        await Promise.all(promises);
        
        setFornecedores(prev => ({ ...prev, ...fornecedorMap }));
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (movimentos.length > 0) {
      fetchFornecedores();
    }
  }, [movimentos]); // Apenas movimentos como dependência

  return { fornecedores, isLoading };
};