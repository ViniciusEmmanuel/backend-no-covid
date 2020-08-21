import { FastifyInstance } from 'fastify';

import fastifyStatic from 'fastify-static';
import { destination } from '../app/middleware/uploadFiles';

import { RouterSession, RouterSessionVersion } from './session.routes';

import { RouterUsers, RouterUsersVersion } from './user.routes';

import { RouterOrder, RouterOrderVersion } from './order.routes';
export class Router {
  constructor(private App: FastifyInstance) {}

  private prefix(routeVersion: string) {
    return `/api${routeVersion}`;
  }

  public async register() {
    await this.App.register(fastifyStatic, {
      root: destination,
      prefix: '/files/',
    });

    await this.App.register(RouterUsers, {
      prefix: this.prefix(RouterUsersVersion),
    });

    await this.App.register(RouterSession, {
      prefix: this.prefix(RouterSessionVersion),
    });

    await this.App.register(RouterOrder, {
      prefix: this.prefix(RouterOrderVersion),
    });

    return this.App;
  }
}
