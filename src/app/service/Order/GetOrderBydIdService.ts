import { isUuid } from 'uuidv4';
import { getRepository } from 'typeorm';

import { Order } from '../../models/Order';
import { AppError } from '../../exceptions/AppErros';
import { StatuOrderEnum } from '../../enum';

interface ResponseGetOrder {
  id: string;
  status: string;
  created_at: Date;
}

export class GetOrderByIdService {
  constructor(private orderRepository = getRepository(Order)) {}

  public async execute(id: string): Promise<ResponseGetOrder> {
    if (!isUuid(id)) {
      throw new AppError('Order not found.', 404);
    }

    const order = await this.orderRepository.findOne(id);

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    return {
      id: order.id,
      status: StatuOrderEnum[order.status],
      created_at: order.created_at,
    };
  }
}
