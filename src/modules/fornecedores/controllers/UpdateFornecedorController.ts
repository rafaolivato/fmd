// src/modules/fornecedores/controllers/UpdateFornecedorController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class UpdateFornecedorController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const { nome, cnpj, telefone, email, endereco } = request.body;

    try {
      // Verificar se o fornecedor existe
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { id }
      });

      if (!fornecedorExistente) {
        throw new AppError('Fornecedor não encontrado.', 404);
      }

      // Verificar se o CNPJ já está em uso por outro fornecedor
      if (cnpj !== fornecedorExistente.cnpj) {
        const cnpjEmUso = await prisma.fornecedor.findUnique({
          where: { cnpj: cnpj.replace(/\D/g, '') }
        });

        if (cnpjEmUso) {
          throw new AppError('Já existe um fornecedor cadastrado com este CNPJ.', 409);
        }
      }

      // Atualizar o fornecedor
      const fornecedorAtualizado = await prisma.fornecedor.update({
        where: { id },
        data: {
          nome,
          cnpj: cnpj.replace(/\D/g, ''),
          telefone,
          email,
          endereco
        }
      });

      return response.json(fornecedorAtualizado);
    } catch (error) {
      next(error);
    }
  }
}

export { UpdateFornecedorController };