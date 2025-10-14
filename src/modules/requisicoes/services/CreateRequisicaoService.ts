// src/modules/requisicoes/services/CreateRequisicaoService.ts

import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateRequisicaoDTO } from '../dtos/ICreateRequisicaoDTO';

class CreateRequisicaoService {
  async execute(data: ICreateRequisicaoDTO) {
    const { solicitanteId, atendenteId, itens, observacao } = data;

    return await prisma.$transaction(async (tx) => {
      
      // 1. Verifica se os estabelecimentos existem
      const solicitante = await tx.estabelecimento.findUnique({ where: { id: solicitanteId } });
      const atendente = await tx.estabelecimento.findUnique({ where: { id: atendenteId } });

      if (!solicitante) {
        throw new AppError('Estabelecimento Solicitante não encontrado.', 404);
      }
      if (!atendente) {
        throw new AppError('Estabelecimento Atendente (Almoxarifado) não encontrado.', 404);
      }

      // 2. Cria o cabeçalho da Requisição
      const requisicao = await tx.requisicao.create({
        data: {
          solicitanteId,
          atendenteId,
          // Observacao não está no seu modelo, mas se estiver no DTO pode ser adicionada aqui
          status: 'PENDENTE', 
        },
      });

      const operacoesItens: Promise<any>[] = [];

      // 3. Processa e cria os itens solicitados
      for (const item of itens) {
        
        // Verifica se o Medicamento existe (Validação importante)
        const medicamento = await tx.medicamento.findUnique({ 
          where: { id: item.medicamentoId },
          select: { id: true } 
        });
        
        if (!medicamento) {
            throw new AppError(`Medicamento ID ${item.medicamentoId} não encontrado.`, 404);
        }

        operacoesItens.push(
          tx.itemRequisicao.create({
            data: {
              quantidadeSolicitada: item.quantidadeSolicitada,
              quantidadeAtendida: 0, // Inicia em 0
              medicamentoId: item.medicamentoId,
              requisicaoId: requisicao.id,
            },
          })
        );
      }
      
      // Executa a criação de todos os itens em lote
      await Promise.all(operacoesItens);

      return requisicao;
    });
  }
}

export { CreateRequisicaoService };