import { getRepository } from 'typeorm';
import twilioService from 'twilio';

import { Order } from '../../models/Order';
import { StoreOrder } from '../../models/StoreOrder';

import { StatuOrderEnum, StatusShopOrderEnum } from '../../enum';
import { isUuid } from 'uuidv4';

export class CancelationOrderTimout {
  constructor(
    private orderRepository = getRepository(Order),
    private storeOrderRepository = getRepository(StoreOrder),
  ) {}

  public async execute(orderId: string): Promise<void> {
    if (!isUuid(orderId)) return;

    const order = await this.orderRepository.findOne(orderId);

    if (!order) return;

    if (order.status === StatuOrderEnum.pending) {
      order.status = StatuOrderEnum.canceledForStoreTimeout;

      await this.orderRepository.save(order);

      const storeOrders = await this.storeOrderRepository.find({
        relations: ['order', 'store'],
        where: {
          order_id: order.id,
          status: StatusShopOrderEnum.awaitingStore,
        },
      });

      const updatedStoreOrders = storeOrders.map(storeOrder => {
        storeOrder.status = StatusShopOrderEnum.canceledForTimeout;

        return storeOrder;
      });

      if (updatedStoreOrders.length > 0) {
        await this.storeOrderRepository.save(updatedStoreOrders);

        await this.sendCancelationMessageTwilio(updatedStoreOrders);
      }
    }
  }

  private async sendCancelationMessageTwilio(storeOrders: StoreOrder[] = []) {
    const twilio = twilioService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const messageCacelation = (orderNumber: number) =>
      `O prazo para aceitar o pedido *${orderNumber}* foi encerrado.`;

    const promissesMessageTwilio = storeOrders.map(storeOrder =>
      twilio.messages.create({
        body: messageCacelation(storeOrder.order.order),
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${storeOrder.store.whatsapp}`,
      }),
    );

    await Promise.all(promissesMessageTwilio);
  }
}
