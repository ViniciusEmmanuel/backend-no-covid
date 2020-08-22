import { FastifyInstance } from 'fastify';
import { AppError } from './AppErros';

export class ExceptionHandler {
  private app: FastifyInstance;
  constructor(app: FastifyInstance) {
    this.app = app;
  }

  public execute() {
    this.app.setErrorHandler(function (error, _, response) {
      if (error instanceof AppError) {
        console.error('AppError:', error);

        return response.status(error.statusCode).send({
          status: 'error',
          message: error.message,
        });
      }

      console.error('GenericError:', error);

      if (
        error.name === 'Error' ||
        (error.validation && error.validation.length > 0)
      ) {
        return response.send({
          status: 'error',
          message: error.message,
        });
      }

      return response.status(500).send({
        status: 'error',
        message: 'Internal server error',
      });
    });

    return this.app;
  }
}
