// src/modules/dispensacao/services/CreateDispensacaoService.ts

import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateDispensacaoDTO } from '../dtos/ICreateDispensacaoDTO';
import { Prisma } from '@prisma/client';

type PrismaTransaction = Prisma.TransactionClient; 

class CreateDispensacaoService {
  async execute(data: ICreateDispensacaoDTO) {
    // 1. Inicia a transação para garantir que o estoque só será baixado se tudo for salvo
    const resultado = await prisma.$transaction(async (tx: PrismaTransaction) => {
      
      // A. Cria o Cabeçalho da Dispensação
      const dispensacao = await tx.dispensacao.create({
        data: {
          pacienteNome: data.pacienteNome,
          pacienteCpf: data.pacienteCpf,
          profissionalSaude: data.profissionalSaude,
          documentoReferencia: data.documentoReferencia,
          observacao: data.observacao,
        },
      });

      // Array para as operações que podem ser executadas em paralelo (como a criação do ItemDispensacao)
      const operacoesEmLote: Promise<any>[] = []; 

      // B. Processa cada item a ser dispensado
      for (const item of data.itens) {
        if (item.quantidadeSaida <= 0) {
          throw new AppError('A quantidade de saída deve ser positiva.', 400);
        }

        // 1. Verifica a disponibilidade total de estoque para o medicamento
        const medicamento = await tx.medicamento.findUnique({
          where: { id: item.medicamentoId },
          select: { id: true, principioAtivo: true, quantidadeEstoque: true },
        });

        if (!medicamento) {
          throw new AppError(`Medicamento ID ${item.medicamentoId} não encontrado.`, 404);
        }

        if (medicamento.quantidadeEstoque < item.quantidadeSaida) {
          throw new AppError(`Estoque insuficiente de ${medicamento.principioAtivo}. Disponível: ${medicamento.quantidadeEstoque}. Solicitado: ${item.quantidadeSaida}.`, 400);
        }

        // 2. Lógica FEFO: Encontrar os lotes disponíveis e ativos (não dispensados)
        const lotesDisponiveis = await tx.itemMovimento.findMany({
          where: { 
            medicamentoId: item.medicamentoId,
            quantidade: { gt: 0 }
          },
          orderBy: { dataValidade: 'asc' }, // FEFO: Mais perto de expirar primeiro!
        });

        let quantidadeRestanteParaDispensar = item.quantidadeSaida;
        
        // 3. Consumir dos lotes até atingir a quantidade solicitada
        for (const lote of lotesDisponiveis) {
          if (quantidadeRestanteParaDispensar <= 0) break; 

          const quantidadeDisponivelNoLote = lote.quantidade;
          const quantidadeConsumir = Math.min(quantidadeRestanteParaDispensar, quantidadeDisponivelNoLote);

          // >>> CORREÇÃO CRUCIAL: USANDO 'await' DIRETO PARA FORÇAR A ATUALIZAÇÃO DO LOTE <<<
          await tx.itemMovimento.update({
            where: { id: lote.id },
            data: {
              quantidade: { decrement: quantidadeConsumir },
            },
          });
          // O await garante que esta promise seja resolvida antes de continuar o loop.

          // Registra o detalhe da saída (ItemDispensacao) - Usando push para Promise.all
          operacoesEmLote.push(
            tx.itemDispensacao.create({
              data: {
                quantidadeSaida: quantidadeConsumir,
                loteNumero: lote.numeroLote,
                medicamentoId: item.medicamentoId,
                dispensacaoId: dispensacao.id,
              },
            })
          );

          quantidadeRestanteParaDispensar -= quantidadeConsumir;
        }

        // Se, por alguma falha na lógica, a quantidadeRestante não zerar, é um erro de sistema
        if (quantidadeRestanteParaDispensar > 0) {
            throw new AppError(`Erro interno: Não foi possível baixar a quantidade solicitada (${quantidadeRestanteParaDispensar} restantes) mesmo após checagem inicial.`, 500);
        }

        // 4. Atualiza o ESTOQUE TOTAL (Medicamento) - Usando push para Promise.all
        operacoesEmLote.push(
          tx.medicamento.update({
            where: { id: item.medicamentoId },
            data: {
              quantidadeEstoque: {
                decrement: item.quantidadeSaida, // Subtrai a quantidade total solicitada
              },
            },
          })
        );
      }
      
      // C. Executa as criações de ItemDispensacao e a atualização de Estoque Total
      await Promise.all(operacoesEmLote);
      
      return dispensacao;
    });

    return resultado;
  }
}

export { CreateDispensacaoService };