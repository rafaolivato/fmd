// src/modules/users/services/CreateUserService.ts
import { hash } from 'bcryptjs';
import { ICreateUserDTO } from '../dtos/ICreateUserDTO';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class CreateUserService {
  async execute({ name, email, password, role, estabelecimentoId }: ICreateUserDTO) {
    // 1. Verifica se o usuário já existe
    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      throw new AppError('Este e-mail já está em uso.', 409);
    }

    // 2. Se fornecido, verifica se o estabelecimento existe
    if (estabelecimentoId) {
      const estabelecimentoExists = await prisma.estabelecimento.findUnique({
        where: { id: estabelecimentoId },
      });

      if (!estabelecimentoExists) {
        throw new AppError('Estabelecimento não encontrado.', 404);
      }
    }

    // 3. Criptografa a senha
    const passwordHash = await hash(password, 8);

    // 4. Cria o usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        estabelecimentoId: estabelecimentoId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        estabelecimentoId: true,
        estabelecimento: {
          select: {
            id: true,
            nome: true,
          }
        },
        createdAt: true,
      },
    });

    return user;
  }
}

export { CreateUserService };