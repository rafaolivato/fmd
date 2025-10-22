// src/modules/dispensacao/services/CreateDispensacaoService.ts
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateDispensacaoDTO } from '../dtos/ICreateDispensacaoDTO';

class CreateDispensacaoService {
  async execute(data: ICreateDispensacaoDTO) {
    const { estabelecimentoOrigemId, itens, ...dispensacaoData } = data;

    // 1. Validação do Estabelecimento
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: estabelecimentoOrigemId }
    });

    if (!estabelecimento) {
      throw new AppError('Estabelecimento de origem não encontrado.', 400);
    }

    return await prisma.$transaction(async (tx) => {
      // 2. Cria o cabeçalho da Dispensação (SEM pacienteId)
      const novaDispensacao = await tx.dispensacao.create({
        data: {
          pacienteNome: dispensacaoData.pacienteNome,
          pacienteCpf: dispensacaoData.pacienteCpf || null,
          profissionalSaude: dispensacaoData.profissionalSaude || null,
          documentoReferencia: dispensacaoData.documentoReferencia,
          observacao: dispensacaoData.observacao || null,
          estabelecimentoOrigemId,
          dataDispensacao: new Date(),
        },
      });

      console.log('✅ Dispensação criada:', novaDispensacao.id);

      // 3. Processa cada Item
      for (const item of itens) {
        const { medicamentoId } = item;
        const quantidadeSaidaNumerica = Number(item.quantidadeSaida);

        // Validações
        if (isNaN(quantidadeSaidaNumerica) || quantidadeSaidaNumerica <= 0) {
          throw new AppError('Quantidade de saída inválida.', 400);
        }

        // Verifica estoque geral
        const estoqueGeral = await tx.estoqueLocal.findUnique({
          where: {
            medicamentoId_estabelecimentoId: { 
              medicamentoId, 
              estabelecimentoId: estabelecimentoOrigemId 
            },
          },
        });

        if (!estoqueGeral || estoqueGeral.quantidade < quantidadeSaidaNumerica) {
          const medicamento = await tx.medicamento.findUnique({
            where: { id: medicamentoId }
          });
          throw new AppError(
            `Estoque insuficiente de ${medicamento?.principioAtivo}. Saldo: ${estoqueGeral?.quantidade ?? 0}.`, 
            400
          );
        }

        console.log(`📦 Processando medicamento ${medicamentoId}, quantidade: ${quantidadeSaidaNumerica}`);

        // Busca lotes (FIFO)
        let quantidadeRestante = quantidadeSaidaNumerica;
        const lotesDisponiveis = await tx.estoqueLote.findMany({
          where: {
            medicamentoId,
            estabelecimentoId: estabelecimentoOrigemId,
            quantidade: { gt: 0 },
          },
          orderBy: { dataValidade: 'asc' }
        });

        if (lotesDisponiveis.length === 0) {
          throw new AppError(`Nenhum lote disponível para o medicamento selecionado.`, 400);
        }

        // Baixa de estoque por lote
        for (const lote of lotesDisponiveis) {
          if (quantidadeRestante === 0) break;

          const quantidadeBaixar = Math.min(quantidadeRestante, lote.quantidade);

          console.log(`⬇️ Baixando ${quantidadeBaixar} unidades do lote ${lote.numeroLote}`);

          // Atualiza lote
          await tx.estoqueLote.update({
            where: { id: lote.id },
            data: { quantidade: { decrement: quantidadeBaixar } }
          });

          // Cria item da dispensação
          await tx.itemDispensacao.create({
            data: {
              quantidadeSaida: quantidadeBaixar,
              loteNumero: lote.numeroLote,
              medicamentoId: medicamentoId,
              dispensacaoId: novaDispensacao.id,
            }
          });

          quantidadeRestante -= quantidadeBaixar;
        }

        if (quantidadeRestante > 0) {
          throw new AppError(`Não foi possível baixar toda a quantidade. Faltaram ${quantidadeRestante} unidades.`, 400);
        }

        // Atualiza estoque geral
        await tx.estoqueLocal.update({
          where: { id: estoqueGeral.id },
          data: { quantidade: { decrement: quantidadeSaidaNumerica } },
        });

        console.log(`✅ Medicamento ${medicamentoId} processado com sucesso`);
      }

      console.log('🎉 Dispensação finalizada com sucesso!');

      // Retorna dispensação completa
      return tx.dispensacao.findUnique({
        where: { id: novaDispensacao.id },
        include: { 
          itensDispensados: {
            include: {
              medicamento: {
                select: {
                  principioAtivo: true,
                  concentracao: true,
                  formaFarmaceutica: true
                }
              }
            }
          },
          estabelecimentoOrigem: {
            select: {
              nome: true
            }
          }
        }
      });
    });
  }
}

export { CreateDispensacaoService };