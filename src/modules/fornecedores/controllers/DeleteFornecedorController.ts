// src/modules/fornecedores/controllers/DeleteFornecedorController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class DeleteFornecedorController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    try {
      // Verificar se o fornecedor existe
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { id }
      });

      if (!fornecedorExistente) {
        throw new AppError('Fornecedor não encontrado.', 404);
      }

      // Verificar se o fornecedor tem movimentos vinculados
      const movimentosVinculados = await prisma.movimento.findFirst({
        where: { fornecedorId: id }
      });

      if (movimentosVinculados) {
        throw new AppError(
          'Não é possível excluir este fornecedor pois existem movimentos vinculados a ele.',
          400
        );
      }

      // Excluir o fornecedor (soft delete - marcar como inativo)
      const fornecedorAtualizado = await prisma.fornecedor.update({
        where: { id },
        data: {
          ativo: false
        }
      });

      return response.json({ 
        message: 'Fornecedor excluído com sucesso.',
        fornecedor: fornecedorAtualizado 
      });

      // OU para exclusão física (descomente se quiser excluir definitivamente):
      /*
      await prisma.fornecedor.delete({
        where: { id }
      });

      return response.status(204).send();
      */
    } catch (error) {
      next(error);
    }
  }
}

export { DeleteFornecedorController };