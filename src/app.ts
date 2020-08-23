import 'dotenv/config';
import 'reflect-metadata';

import fastify, { FastifyInstance } from 'fastify';
import fastifyFormBody from 'fastify-formbody';
import fastifyWs from 'fastify-websocket';

import cors from 'fastify-cors';
import configCors from './config/Cors';

import { ORM } from './config/ORM';
import { ServerOptions } from './config/ServerOption';
import { Router } from './routes';
import { ExceptionHandler } from './app/exceptions/ExceptionHandler';
import { Events } from './app/Events';

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

  private ws() {
    this.app.register(fastifyWs, {
      options: {
        clientTracking: true,
        //path: 'api/v1/orders/:id',
      },
    });
  }

  private events() {
    new Events(this.app).execute();
  }

  public async run() {
    try {
      this.execptionHandler();
      this.cors();
      this.parsedContentType();
      this.ws();
      this.events();

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
