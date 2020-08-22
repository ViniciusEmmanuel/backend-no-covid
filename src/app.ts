import 'dotenv/config';
import 'reflect-metadata';

import fastify, { FastifyInstance, FastifyError } from 'fastify';
import fastifyFormBody from 'fastify-formbody';
import './app/Events';

import cors from 'fastify-cors';
import configCors from './config/Cors';

import { ORM } from './config/ORM';
import { ServerOptions } from './config/ServerOption';
import { Router } from './routes';
import { ExceptionHandler } from './app/exceptions/ExceptionHandler';

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
    this.app = new ExceptionHandler(this.app).execute();
  }

  private parsedContentType() {
    this.app.register(fastifyFormBody);
  }

  public async run() {
    try {
      this.execptionHandler();
      this.cors();
      this.parsedContentType();

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
