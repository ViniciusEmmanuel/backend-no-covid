import { getRepository } from 'typeorm';
import twilioService from 'twilio';

import { StatuOrderEnum, StatusShopOrderEnum } from '../../enum';

import { Order } from '../../models/Order';
import { StoreOrder } from '../../models/StoreOrder';
import { Store } from '../../models/Store';

import { AppError } from '../../exceptions/AppErros';

interface IOrder {
  produto: string;
  marca: string;
  quantidade: string;
}

interface CreateOrder {
  order: IOrder[];
  userId: string;
}

interface ResponseCreateOrder {
  id: string;
  status: string;
  created_at: Date;
}

export class CreateOrderService {
  constructor(
    private orderRepository = getRepository(Order),
    private storeOrderRepository = getRepository(StoreOrder),
    private storeRepository = getRepository(Store),
  ) {}

  public async execute({
    order,
    userId,
  }: CreateOrder): Promise<ResponseCreateOrder> {
    if (!order || !Array.isArray(order) || order.length === 0) {
      throw new AppError('Order cannot be empty.');
    }

    const newOrder = this.orderRepository.create({
      user_id: userId,
      status: StatuOrderEnum.pending,
      itens: order,
    });

    // Envio de messagens para o whats das lojas

    const parsedOrderToMessage = order.reduce(
      (acc, item: IOrder, index: number) => {
        if (index === 0) {
          acc += '\n';
        }

        const { produto, quantidade } = item;

        const marca = item.marca || 'Qualquer marca disponivel.';

        acc += '\n';
        acc += `Produto: ${produto} | Marca: ${marca} | Quantidade: ${quantidade}`;
        acc += '\n';

        return acc;
      },
      '',
    );

    const twilio = twilioService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    await this.orderRepository.save(newOrder);

    const messageOrder = `Comércio do Seu João, o senhor tem um pedido para analisar ${parsedOrderToMessage} \n \n Por favor, para aceitar o pedido, digite 1`;

    const stores = await this.storeRepository.find();

    //'whatsapp:+553496307984'

    const promissesMessageTwilio = stores.map(store =>
      twilio.messages.create({
        body: messageOrder,
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${store.whatsapp}`,
      }),
    );

    const messages = await Promise.all(promissesMessageTwilio);

    const storeOrders = messages.map((message, index) =>
      this.storeOrderRepository.create({
        message_twilio_sid: message.sid,
        order_id: newOrder.id,
        store_id: stores[index].id,
        status: StatusShopOrderEnum.awaitingStore,
      }),
    );

    await this.storeOrderRepository.save(storeOrders);

    return {
      id: newOrder.id,
      status: StatuOrderEnum[newOrder.status],
      created_at: newOrder.created_at,
    };
  }
}
