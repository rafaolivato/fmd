import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class UpdateMedicamentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const {
      principioAtivo,
      concentracao,
      formaFarmaceutica,
      psicotropico,
      estoqueMinimo,
      categoriaControladaId // ← ADICIONE ESTE CAMPO
    } = request.body;

    console.log('📥 Dados recebidos no UPDATE:', {
      principioAtivo,
      concentracao,
      formaFarmaceutica,
      psicotropico,
      estoqueMinimo,
      categoriaControladaId // ← Para debug
    });

    try {
      // Verifica se o medicamento existe
      const medicamentoExiste = await prisma.medicamento.findUnique({
        where: { id }
      });

      if (!medicamentoExiste) {
        throw new AppError('Medicamento não encontrado.', 404);
      }

      // Verifica se outro medicamento já usa este princípio ativo
      if (principioAtivo !== medicamentoExiste.principioAtivo) {
        const principioAtivoEmUso = await prisma.medicamento.findUnique({
          where: { principioAtivo }
        });

        if (principioAtivoEmUso) {
          throw new AppError('Já existe um medicamento cadastrado com este Princípio Ativo.', 409);
        }
      }

      // Se categoriaControladaId foi fornecido, verificar se existe
      if (categoriaControladaId) {
        const categoriaExistente = await prisma.categoriaControlada.findUnique({
          where: { id: categoriaControladaId }
        });

        if (!categoriaExistente) {
          throw new AppError('Categoria controlada não encontrada.', 404);
        }
      }

      // Atualizar o medicamento incluindo a categoria
      const medicamento = await prisma.medicamento.update({
        where: { id },
        data: {
          principioAtivo,
          concentracao,
          formaFarmaceutica,
          psicotropico,
          estoqueMinimo: Number(estoqueMinimo),
          categoriaControladaId: categoriaControladaId || null // ← ADICIONE AQUI
        },
        include: {
          categoriaControlada: true // ← INCLUA A CATEGORIA NA RESPOSTA
        }
      });

      console.log('✅ Medicamento atualizado:', medicamento);
      return response.json(medicamento);

    } catch (error) {
      console.error('💥 Erro ao atualizar medicamento:', error);
      next(error);
    }
  }
}

export { UpdateMedicamentoController };