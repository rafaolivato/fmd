// src/modules/dispensacao/services/CreateDispensacaoService.ts

import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateDispensacaoDTO } from '../dtos/ICreateDispensacaoDTO';
import { Prisma } from '@prisma/client';

// NOTE: Este código assume a existência de um modelo 'EstoqueLote' ou 'Lote' 
// para rastrear o saldo por lote/vencimento.

class CreateDispensacaoService {
  async execute(data: ICreateDispensacaoDTO) {
    const { estabelecimentoOrigemId, itens, ...dispensacaoData } = data;

    // 1. Validação do Estabelecimento (A Farmácia)
    const estabelecimento = await prisma.estabelecimento.findUnique({ 
        where: { id: estabelecimentoOrigemId } 
    });

    if (!estabelecimento || estabelecimento.tipo !== 'FARMACIA_UNIDADE') {
        throw new AppError('Estabelecimento de origem inválido ou não é uma Farmácia.', 400);
    }

    return await prisma.$transaction(async (tx) => {
      
      // 2. Cria o cabeçalho da Dispensação
      const novaDispensacao = await tx.dispensacao.create({
        data: {
          ...dispensacaoData, // pacienteNome, pacienteCpf, etc.
          estabelecimentoOrigemId,
          dataDispensacao: new Date(),
        },
      });

      const operacoesEmLote: Promise<any>[] = [];
      
      // 3. Processa cada Item
      for (const item of itens) {
        const { medicamentoId, quantidadeSaida, loteId: loteForcado } = item;

        // 3.1. CHECAGEM DE ESTOQUE LOCAL (Geral)
        const estoqueGeral = await tx.estoqueLocal.findUnique({
          where: {
            medicamentoId_estabelecimentoId: { medicamentoId, estabelecimentoId: estabelecimentoOrigemId },
          },
        });

        if (!estoqueGeral || estoqueGeral.quantidade < quantidadeSaida) {
          throw new AppError(`Estoque insuficiente de ID ${medicamentoId}. Saldo na farmácia: ${estoqueGeral?.quantidade ?? 0}.`, 400);
        }

        // 3.2. BUSCA DE LOTES (FIFO: Vencimento mais próximo primeiro)
        
        let quantidadeRestante = quantidadeSaida;

        const lotesDisponiveis = await tx.estoqueLote.findMany({ // <--- Tabela Crítica
            where: {
                medicamentoId,
                estabelecimentoId: estabelecimentoOrigemId,
                quantidade: { gt: 0 },
                // Adiciona filtro se o usuário forçou um lote
                ...(loteForcado && { id: loteForcado }) 
            },
            orderBy: {
                dataValidade: 'asc', // Regra FIFO: mais perto do vencimento primeiro
            }
        });

        // 3.3. BAIXA DE ESTOQUE POR LOTE
        const itensDispensadosCriados: Prisma.ItemDispensacaoCreateManyInput[] = [];

        for (const lote of lotesDisponiveis) {
            if (quantidadeRestante === 0) break;

            const quantidadeBaixar = Math.min(quantidadeRestante, lote.quantidade);

            // A. Atualiza o saldo do Lote (DECREMENTA)
            operacoesEmLote.push(
                tx.estoqueLote.update({
                    where: { id: lote.id },
                    data: { quantidade: { decrement: quantidadeBaixar } }
                })
            );

            // B. Prepara a criação do ItemDispensacao (para registro)
            itensDispensadosCriados.push({
                quantidadeSaida: quantidadeBaixar,
                loteNumero: lote.numeroLote, // Assumindo que o lote tem numeroLote
                medicamentoId: medicamentoId, // <--- ADICIONE O ID EXPLÍCITO AQUI!
                dispensacaoId: novaDispensacao.id, // Adicione aqui também para simplificar
    });

            quantidadeRestante -= quantidadeBaixar;
        }

        // 3.4. Atualiza EstoqueLocal (Geral) - DECREMENTA
        operacoesEmLote.push(
            tx.estoqueLocal.update({
                where: { id: estoqueGeral.id },
                data: { quantidade: { decrement: quantidadeSaida } },
            })
        );
        
        // 3.5. Cria os registros de ItemDispensacao
        // Adiciona a criação dos itens após o loop de lotes
        operacoesEmLote.push(tx.itemDispensacao.createMany({
            data: itensDispensadosCriados.map(item => ({
                ...item,
                dispensacaoId: novaDispensacao.id // Garante o relacionamento
            }))
        }));
      }
      
      // 4. Executa todas as operações
      await Promise.all(operacoesEmLote);
      
      // 5. Retorna o registro completo
      return tx.dispensacao.findUnique({ where: { id: novaDispensacao.id }, include: { itensDispensados: true } });
    });
  }
}

export { CreateDispensacaoService };