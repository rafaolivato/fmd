// modules/users/services/CreateUserService.ts

import { hash } from 'bcryptjs';
import { ICreateUserDTO } from '../dtos/ICreateUserDTO';
import { prisma } from '../../../database/prismaClient'; // Importe o seu Prisma Client
import { AppError } from '../../../shared/errors/AppError'; // Importe o AppError

class CreateUserService {
  async execute({ name, email, password, role }: ICreateUserDTO) {
    // 1. Verifica se o usuário já existe
    const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      // Usamos a classe de erro que criamos
      throw new AppError('Este e-mail já está em uso.', 409); // 409 Conflict
    }

    // 2. Criptografa a senha
    // O 8 é o 'salt' (custo computacional) - 8 é um bom ponto de partida
    const passwordHash = await hash(password, 8);

    // 3. Cria o usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role, // Se for undefined, o Prisma usa o default 'farmaceutico'
      },
      select: { // Retorna apenas dados seguros (sem a senha criptografada)
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }
}

export { CreateUserService };