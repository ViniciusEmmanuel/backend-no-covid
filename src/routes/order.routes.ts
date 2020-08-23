import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { OrderController } from '../app/controller/OrderController';
import { ensureAuthenticated } from '../app/middleware/ensureAuthenticated';

const RouterOrder = (
  app: FastifyInstance<Server, IncomingMessage, ServerResponse>,
  opts: { prefix: string },
  next: (err?: Error) => void,
) => {
  app.get(
    '/orders',
    {
      preHandler: [ensureAuthenticated],
    },
    new OrderController().getAll,
  );

  app.get(
    '/orders/:id',
    {
      preHandler: [ensureAuthenticated],
      schema: {
        params: {
          id: { type: 'string' },
        },
      },
    },
    new OrderController().getById,
  );

  app.post(
    '/orders',
    { preHandler: [ensureAuthenticated] },
    new OrderController().store,
  );

  app.put(
    '/orders',
    {
      preHandler: [ensureAuthenticated],
      schema: {
        params: {
          id: { type: 'string' },
        },
      },
    },
    new OrderController().update,
  );

  next();
};

const RouterOrderVersion = '/v1';

export { RouterOrder, RouterOrderVersion };
