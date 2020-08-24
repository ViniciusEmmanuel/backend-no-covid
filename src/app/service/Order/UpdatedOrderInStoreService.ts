import twilioService from 'twilio';
import { isUuid } from 'uuidv4';
import { getRepository, Not, WhereExpression } from 'typeorm';

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

interface IUpdatedOrderInStore {
  orderId: string;
  userId: string;
  storeId: string;
  type: number;
  entrega: number;
  meio: number;
}

export class UpdatedOrderInStoreService {
  constructor(
    private orderRepository = getRepository(Order),
    private storeOrderRepository = getRepository(StoreOrder),
  ) {}

  public async execute({
    orderId,
    userId,
    storeId,
    type,
    entrega,
    meio,
  }: IUpdatedOrderInStore) {
    //

    if (!isUuid(userId) || !isUuid(storeId) || !isUuid(orderId)) {
      throw new AppError('Order not found.', 404);
    }

    const order = await this.orderRepository.findOne(orderId);

    const storeOrder = await this.storeOrderRepository.findOne({
      where: { order_id: orderId, store_id: storeId },
    });

    if (!order || !storeOrder) {
      throw new AppError('Order not found.', 404);
    }

    if (Number(type) === 1) {
      order.status = StatuOrderEnum.separation;
      order.store_id = storeId;

      await this.orderRepository.save(order);

      storeOrder.status = StatusShopOrderEnum.acceptByClient;

      await this.storeOrderRepository.save(storeOrder);

      await this.sendAcceptStoreMessageTwilio(
        [storeOrder],
        Number(entrega),
        Number(meio),
      );

      const storeOrders = await this.storeOrderRepository.find({
        where: {
          order_id: orderId,
          store_id: StatusShopOrderEnum.awaitingUser,
        },
      });

      if (storeOrders.length > 0) {
        const updatedStoreOrder = storeOrders.map(storeOrder => {
          storeOrder.status = StatusShopOrderEnum.refusedByClient;

          return storeOrder;
        });

        await this.storeOrderRepository.save(updatedStoreOrder);

        await this.sendCancelationMessageTwilio(updatedStoreOrder);
      }
    }

    // Recusou o pedido
    if (Number(type) === 2) {
      storeOrder.status = StatusShopOrderEnum.refusedByClient;

      await this.storeOrderRepository.save(storeOrder);

      await this.sendCancelationMessageTwilio([storeOrder]);
    }
  }

  private async sendCancelationMessageTwilio(storeOrders: StoreOrder[] = []) {
    const twilio = twilioService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const messageCacelation = (orderNumber: number) =>
      `O cliente do pedido *${orderNumber}* recusou sua proposta, aguarde as próximas listas.`;

    const promissesMessageTwilio = storeOrders.map(storeOrder =>
      twilio.messages.create({
        body: messageCacelation(storeOrder.order.order),
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${storeOrder.store.whatsapp}`,
      }),
    );

    await Promise.all(promissesMessageTwilio);
  }

  private async sendAcceptStoreMessageTwilio(
    storeOrders: StoreOrder[] = [],
    typeDelivery: number,
    typePayment: number,
  ) {
    const twilio = twilioService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const entrega = (numberEntrega: number) => {
      if (numberEntrega === 1) {
        return 'retira no local.';
      }

      return 'entrega no local.';
    };

    const meio = (meioNumber: number) => {
      if (meioNumber === 1) {
        return 'dinheiro';
      }

      return 'cartão';
    };

    const messageAccept = (orderNumber: number) =>
      `O pedido *${orderNumber}* escolheu seu estabelecimento. \n\n O meio de pagamento é *${meio(
        typePayment,
      )}*  \n\n O método de entrega selecionado é *${entrega(typeDelivery)}*.`;

    const promissesMessageTwilio = storeOrders.map(storeOrder =>
      twilio.messages.create({
        body: messageAccept(storeOrder.order.order),
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${storeOrder.store.whatsapp}`,
      }),
    );

    await Promise.all(promissesMessageTwilio);
  }
}
