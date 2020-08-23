import { isUuid } from 'uuidv4';
import { getRepository } from 'typeorm';

import { Order } from '../../models/Order';
import { AppError } from '../../exceptions/AppErros';

export class GetAllOrderService {
  constructor(private orderRepository = getRepository(Order)) {}

  public async execute(userId: string): Promise<Order[]> {
    if (!isUuid(userId)) {
      throw new AppError('Order for user not found.', 404);
    }

    const orders = await this.orderRepository.find({
      where: {
        user_id: userId,
      },
      order: { created_at: 'DESC' },
    });

    return orders;
  }
}
