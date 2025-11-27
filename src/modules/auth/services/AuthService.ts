import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../../shared/errors/AppError';
import { prisma } from '../../../database/prismaClient'; 
import { IAuthRequestDTO } from '../dtos/IAuthRequestDTO';

class AuthService {
  async execute({ email, password }: IAuthRequestDTO) {
    // 1. Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });
   
    if (!user) {
      throw new AppError('Email ou senha incorretos.', 401);
    }

    // 2. Compara a senha (Criptografada)
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Email ou senha incorretos.', 401);
    }

    // 3. Gera o Token JWT
    const token = sign({}, 'sua_chave_secreta_aqui', {
      subject: user.id, // O ID do usuário no token
      expiresIn: '1d', // Expira em 1 dia
    });

    // Retorna o usuário e o token
    return { user, token };
  }
}

export { AuthService };