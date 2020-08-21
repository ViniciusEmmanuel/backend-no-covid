/**
 * Class para o fluxo de erros nas rotas
 */

import { FastifyError } from 'fastify';

interface Teste extends FastifyError {}

export class AppError {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
