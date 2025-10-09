// src/middlewares/ensureAuthenticated.ts

import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../shared/errors/AppError';
import authConfig from '../config/auth';

interface TokenPayload {
    sub: string;
}

export function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    const authHeader = request.headers[authConfig.header.toLowerCase()]; 

    if (!authHeader || Array.isArray(authHeader)) { 
        throw new AppError('Token JWT ausente.', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verify(token, authConfig.jwt.secret);
        const { sub } = decoded as TokenPayload;

        // CORREÇÃO: Usamos o Type Assertion para INJETAR o 'user' na Request
        (request as Request & { user: { id: string } }).user = { 
            id: sub,
        };
        
        return next();
    } catch (error) {
        throw new AppError('Token JWT inválido.', 401);
    }
}