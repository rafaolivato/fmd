// src/modules/fornecedores/controllers/CreateFornecedorController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';



class CreateFornecedorController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { nome, cnpj, telefone, email, endereco } = request.body;

    try {
      // Verificar se CNPJ já existe
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { cnpj }
      });

      if (fornecedorExistente) {
        throw new AppError('Já existe um fornecedor cadastrado com este CNPJ.', 409);
      }

      const fornecedor = await prisma.fornecedor.create({
        data: {
          nome,
          cnpj: cnpj.replace(/\D/g, ''),
          telefone,
          email,
          endereco,
          ativo: true
        }
      });

      return response.status(201).json(fornecedor);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateFornecedorController };