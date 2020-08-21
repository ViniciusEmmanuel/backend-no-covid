import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { OrderController } from '../app/controller/OrderController';

const RouterOrder = (
  app: FastifyInstance<Server, IncomingMessage, ServerResponse>,
  opts: { prefix: string },
  next: (err?: Error) => void,
) => {
  app.get(
    '/orders/:id',
    {
      schema: {
        params: {
          id: { type: 'string' },
        },
      },
    },
    new OrderController().getById,
  );

  app.post('/orders', {}, new OrderController().store);

  next();
};

const RouterOrderVersion = '/v1';

export { RouterOrder, RouterOrderVersion };
