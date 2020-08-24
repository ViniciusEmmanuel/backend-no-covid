import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage } from 'http';
import { SocketStream } from 'fastify-websocket';
import { CreateOrderService } from '../service/Order/CreateOrderService';
import { GetOrderByIdService } from '../service/Order/GetOrderBydIdService';

import { Event } from '../provider/EventsEmiter';
import { GetAllOrderService } from '../service/Order/GetAllOrdersService';
import { AppError } from '../exceptions/AppErros';
import { Order } from '../models/Order';
import { AuthenticateToken } from '../provider/AuthenticateToken';
import { UpdatedOrderInStoreService } from '../service/Order/UpdatedOrderInStoreService';

interface IOrder {
  categoria: string;
  produto: string;
  marca: string;
  quantidade: string;
}

interface RequestBody {
  order: IOrder[];
}

export class OrderController {
  public async getAll(request: FastifyRequest, response: FastifyReply) {
    const getAllOrderService = new GetAllOrderService();

    const order = await getAllOrderService.execute(request.user.id);

    return response.status(200).send(order);
  }

  public async getById(
    connection: SocketStream,
    request: IncomingMessage,
    params: { id: string },
  ) {
    const { url, headers } = request;

    let token = null;

    if (url) {
      [token] = url
        .split('?')
        .filter((item: string) =>
          item.match(new RegExp(/(token=[a-zA-Z0-9._-]+)/g)),
        );
    }
    if (!token) return connection.socket.end('Not authorized');

    const parsedToken = token.split('=')[1];

    const { id } = new AuthenticateToken().verify({ token: parsedToken });

    connection.socket.id = id;

    try {
      const getOrderByIdService = new GetOrderByIdService();

      const { order, storeOrder } = await getOrderByIdService.execute(
        params.id,
      );

      connection.socket.send(JSON.stringify({ order, storeOrder }));

      return;
    } catch (error) {
      if (error instanceof AppError) {
        connection.socket.send(error.message);
        return;
      }
      connection.socket.send('Not found order.');
      return;
    }

    // return response.status(200).send(order);
  }

  public async store(request: FastifyRequest, response: FastifyReply) {
    const { order } = request.body as RequestBody;

    const createOrderService = new CreateOrderService();

    const newOrder = await createOrderService.execute({
      order,
      userId: request.user.id,
    });

    Event.emit('new:order', newOrder);

    return response.status(201).send(newOrder);
  }

  public async update(request: FastifyRequest, response: FastifyReply) {
    const { id } = request.params as { id: string };

    const { store, entrega, meio, type } = request.body as {
      type: number;
      store: string;
      entrega: number;
      meio: number;
    };

    const updatedOrderInStoreService = new UpdatedOrderInStoreService();

    await updatedOrderInStoreService.execute({
      orderId: id,
      userId: request.user.id,
      storeId: store,
      entrega,
      meio,
      type,
    });

    return response.status(204).send({});
  }
}
