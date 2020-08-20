import 'dotenv/config';
import 'reflect-metadata';

import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import cors from 'fastify-cors';
import configCors from './config/Cors';

import { ORM } from './config/ORM';
import { ServerOptions } from './config/ServerOption';
import { Router } from './routes';
import { AppError } from './app/exceptions/AppErros';
export default class App {
  private app: FastifyInstance;

  constructor() {
    this.app = fastify(ServerOptions);
  }

  private async router() {
    this.app = await new Router(this.app).register();
  }

  private async ORM() {
    return new ORM().execute();
  }

  private cors() {
    return this.app.register(cors, configCors);
  }

  private execptionHandler() {
    this.app.setErrorHandler(function (error, _, response) {
      if (error instanceof AppError) {
        console.error('AppError:', error);

        return response.status(error.statusCode).send({
          status: 'error',
          message: error.message,
        });
      }
      console.error('Internal Error', error);

      return response.status(500).send({
        status: 'error',
        message: 'Internal server error',
      });
    });
  }

  public async run() {
    try {
      this.execptionHandler();
      this.cors();

      await this.router();
      await this.ORM();

      const port = Number(process.env.PORT) || 3333;
      const host = process.env.HOST || '0.0.0.0';

      await this.app.listen(port, host);

      console.log(
        `🚀 Server started on Host::${host} and Port::${port}! Uhull`,
      );
    } catch (error) {
      console.error(error);

      process.exit(1);
    }
  }
}
