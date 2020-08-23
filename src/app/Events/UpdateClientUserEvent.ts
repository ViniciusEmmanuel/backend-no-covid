import { StoreOrder } from '../models/StoreOrder';
import { Order } from '../models/Order';
import { Store } from '../models/Store';
import { getRepository, Repository } from 'typeorm';
import { StatusShopOrderEnum } from '../enum';

export class UpdateClientUserEvent {
  private socketServer: any;

  private storeOrderRepository: Repository<StoreOrder>;
  // private orderRepository: Repository<Order>;
  // private storeRepository: Repository<Store>;

  constructor(socketServer: any) {
    this.socketServer = socketServer;

    this.storeOrderRepository = getRepository(StoreOrder);
    // this.orderRepository = getRepository(Order);
    // this.storeRepository = getRepository(Store);
  }

  public async execute(orderId: string) {
    const storeOrder = await this.storeOrderRepository.find({
      relations: ['order', 'store'],
      where: { order_id: orderId, status: StatusShopOrderEnum.awaitingUser },
    });

    console.log('storeOrder dentro do evento ');

    if (storeOrder && storeOrder.length > 0) {
      this.socketServer.clients.forEach(function each(client: any) {
        if (
          client.readyState === 1 &&
          client.id === storeOrder[0].order.user_id
        ) {
          const order = {
            id: storeOrder[0].order.id,
            status: storeOrder[0].status,
            created_at: storeOrder[0].created_at,
          };

          const stores = storeOrder.map(store => {
            delete store.order;

            return {
              ...store,
            };
          });

          client.send(JSON.stringify({ order, storeOrder: stores }));
        }
      });
    }
  }
}
