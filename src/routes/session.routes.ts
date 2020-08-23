import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { SessionController } from '../app/controller/SessionController';

const RouterSession = (
  app: FastifyInstance<Server, IncomingMessage, ServerResponse>,
  opts: { prefix: string },
  next: (err?: Error) => void,
) => {
  app.post(
    '/sessions',
    {
      websocket: false,
      schema: {
        body: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
    new SessionController().store,
  );

  next();
};

const RouterSessionVersion = '/v1';

export { RouterSession, RouterSessionVersion };
