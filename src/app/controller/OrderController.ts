import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateOrderService } from '../service/Order/CreateOrderService';
import { GetOrderByIdService } from '../service/Order/GetOrderBydIdService';

import { Event } from '../provider/EventsEmiter';

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
  public async getById(request: FastifyRequest, response: FastifyReply) {
    const { id } = request.params as { id: string };

    const getOrderByIdService = new GetOrderByIdService();

    const order = await getOrderByIdService.execute(id);

    return response.status(200).send(order);
  }

  public async store(request: FastifyRequest, response: FastifyReply) {
    const { order } = request.body as RequestBody;

    const createOrderService = new CreateOrderService();

    const user = { id: '0ab8c306-5096-4173-b3ed-08838de192e7' };

    const newOrder = await createOrderService.execute({
      order,
      userId: user.id,
    });

    Event.emit('new:order', newOrder);

    return response.status(201).send(newOrder);
  }

  public async update(request: FastifyRequest, response: FastifyReply) {
    const { id } = request.params as { id: string };
  }
}
