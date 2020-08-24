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

    // Em relação ao pedido parado para o cliente
    // FIXME: Falta informa o cliente

    if (order && order.status !== StatuOrderEnum.separation) {
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

    // Se não existe mais lojas cancelar o pedido

    // Em relação ao pedido parado para a loja

    const storeOrders = await this.storeOrderRepository.find({
      relations: ['order'],
      where: { order_id: orderId },
    });

    if (storeOrders && storeOrders.length > 0) {
      const cancelationStoreOrder = storeOrders.reduce(
        (acc: StoreOrder[], storeOrder) => {
          if (storeOrder.status === StatusShopOrderEnum.acceptOrder) {
            storeOrder.status = StatusShopOrderEnum.canceledForTimeout;
            acc.push(storeOrder);
          }

          return acc;
        },
        [],
      );

      if (cancelationStoreOrder.length > 0) {
        await this.storeOrderRepository.save(cancelationStoreOrder);

        await this.sendCancelationMessageTwilio(cancelationStoreOrder);
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
