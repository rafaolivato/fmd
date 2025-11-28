import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../shared/errors/AppError';
import authConfig from '../config/auth';
import { prisma } from '../database/prismaClient';

interface TokenPayload {
    sub: string;
}

// 👇 INTERFACE CORRIGIDA para aceitar null
interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: string;
    estabelecimentoId: string | null; 
    estabelecimento?: { 
        id: string; 
        nome: string; 
    } | null; 
}

export async function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    const authHeader = request.headers[authConfig.header.toLowerCase()]; 

    if (!authHeader || Array.isArray(authHeader)) { 
        throw new AppError('Token JWT ausente.', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verify(token, authConfig.jwt.secret);
        const { sub } = decoded as TokenPayload;

        // Busca os dados completos do usuário
        const user = await prisma.user.findUnique({
            where: { id: sub },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                estabelecimentoId: true,
                estabelecimento: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        if (!user) {
            throw new AppError('Usuário não encontrado.', 401);
        }

        // 👇 TIPAGEM CORRIGIDA: Usa a interface que aceita null
        (request as Request & { user: AuthenticatedUser }).user = user;
        
        return next();
    } catch (error) {
        throw new AppError('Token JWT inválido.', 401);
    }
}