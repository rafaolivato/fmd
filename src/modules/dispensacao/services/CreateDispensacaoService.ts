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
        // 1. Remova 'quantidadeSaida' da desestruturação.
        const { medicamentoId, loteId: loteForcado } = item;

        // 2. Crie uma variável numérica garantida:
        const quantidadeSaidaNumerica = Number(item.quantidadeSaida);

        // Validação extra (se for NaN, a requisição é inválida)
        if (isNaN(quantidadeSaidaNumerica) || quantidadeSaidaNumerica <= 0) {
          throw new AppError('Quantidade de saída inválida.', 400);
        }

        // 3.1. CHECAGEM DE ESTOQUE LOCAL (Geral)
        const estoqueGeral = await tx.estoqueLocal.findUnique({
          where: {
            medicamentoId_estabelecimentoId: { medicamentoId, estabelecimentoId: estabelecimentoOrigemId },
          },
        });

        if (!estoqueGeral || estoqueGeral.quantidade < quantidadeSaidaNumerica) { 
        throw new AppError(`Estoque insuficiente de ID ${medicamentoId}. Saldo na farmácia: ${estoqueGeral?.quantidade ?? 0}.`, 400);
    }

        // 3.2. BUSCA DE LOTES (FIFO: Vencimento mais próximo primeiro)

        let quantidadeRestante = quantidadeSaidaNumerica;

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
            ((loteId, baixa) => tx.estoqueLote.update({
              where: { id: loteId },
              data: { quantidade: { decrement: baixa } }
            }))(lote.id, quantidadeBaixar)
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

        // Adiciona a criação dos itens após o loop de lotes
        operacoesEmLote.push(
          tx.estoqueLocal.update({
            where: { id: estoqueGeral.id },
            data: { quantidade: { decrement: quantidadeSaidaNumerica } },
          })
        )

        await tx.itemDispensacao.createMany({
          data: itensDispensadosCriados,
        });

      }

      // 4. Executa todas as operações
      await Promise.all(operacoesEmLote);

      // 5. Retorna o registro completo
      return tx.dispensacao.findUnique({ where: { id: novaDispensacao.id }, include: { itensDispensados: true } });
    });
  }
}

export { CreateDispensacaoService };