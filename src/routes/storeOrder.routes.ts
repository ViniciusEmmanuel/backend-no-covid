import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { StoreOrderController } from '../app/controller/StoreOrderController';

const RouterShopOrder = (
  app: FastifyInstance<Server, IncomingMessage, ServerResponse>,
  opts: { prefix: string },
  next: (err?: Error) => void,
) => {
  app.post('/shop/order/messages', {}, new StoreOrderController().store);

  next();
};

const RouterShopOrderVersion = '/v1';

export { RouterShopOrder, RouterShopOrderVersion };
