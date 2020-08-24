import { isUuid } from 'uuidv4';
import { getRepository, In } from 'typeorm';

import { Order } from '../../models/Order';
import { AppError } from '../../exceptions/AppErros';
import { StatuOrderEnum, StatusShopOrderEnum } from '../../enum';
import { StoreOrder } from '../../models/StoreOrder';

interface ResponseGetOrder {
  order: {
    id: string;
    status: string;
    created_at: Date;
  };
  storeOrder: (StoreOrder | undefined)[];
}

export class GetOrderByIdService {
  constructor(
    private orderRepository = getRepository(Order),
    private storeOrderRepository = getRepository(StoreOrder),
  ) {}

  public async execute(id: string): Promise<ResponseGetOrder> {
    if (!isUuid(id)) {
      throw new AppError('Order not found.', 404);
    }

    const order = await this.orderRepository.findOne(id);

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    let stores = null;

    if (order.status === StatuOrderEnum.separation) {
      const storeOrder = await this.storeOrderRepository.find({
        relations: ['store'],
        where: {
          order_id: id,
          status: StatusShopOrderEnum.acceptByClient,
        },
      });

      stores = storeOrder.map(storeOrder => {
        delete storeOrder.order;

        if (order.status === StatuOrderEnum.separation) {
          if (storeOrder.store_id === order.store_id) {
            return {
              ...storeOrder,
            };
          }
        } else {
          return {
            ...storeOrder,
          };
        }
      });
    } else {
      const storeOrder = await this.storeOrderRepository.find({
        relations: ['store'],
        where: {
          order_id: id,
          status: StatusShopOrderEnum.awaitingUser,
        },
      });

      stores = storeOrder.map(storeOrder => {
        delete storeOrder.order;

        if (order.status === StatuOrderEnum.separation) {
          if (storeOrder.store_id === order.store_id) {
            return {
              ...storeOrder,
            };
          }
        } else {
          return {
            ...storeOrder,
          };
        }
      });
    }

    return {
      order: {
        id: order.id,
        status: StatuOrderEnum[order.status],
        created_at: order.created_at,
      },
      storeOrder: stores,
    };
  }
}
