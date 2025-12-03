import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

export function ensureAdmin(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  // Como você já tem ensureAuthenticated antes, o usuário estará disponível
  const user = (request as any).user;
  
  if (!user) {
    throw new AppError('Usuário não autenticado', 401);
  }
  
  if (user.role !== 'admin') {
    throw new AppError('Acesso negado. Permissão de administrador necessária.', 403);
  }
  
  return next();
}