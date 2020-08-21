import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateOrderService } from '../service/CreateOrderService';

import twilioService from 'twilio';

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
  public async store(request: FastifyRequest, response: FastifyReply) {
    const { order } = request.body as RequestBody;

    const createOrderService = new CreateOrderService();

    const user = { id: '180b8154-81e3-49e7-8f7e-0892c8d04a33' };

    const newOrder = await createOrderService.execute({
      order,
      userId: user.id,
    });

    return response.status(201).send(newOrder);
  }
}
