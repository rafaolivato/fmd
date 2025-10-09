// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

// O Express exige que middlewares de erro tenham 4 parâmetros
const errorHandler = (
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // 1. Erro conhecido (AppError)
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // 2. Erro desconhecido (Server Error 500)
  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export { errorHandler };