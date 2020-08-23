import { getRepository } from 'typeorm';
import twilioService from 'twilio';

import { StatuOrderEnum, StatusShopOrderEnum } from '../../enum';

import { Order } from '../../models/Order';
import { StoreOrder } from '../../models/StoreOrder';
import { Store } from '../../models/Store';

import { AppError } from '../../exceptions/AppErros';
import {
  MessageListInstance,
  MessageInstance,
} from 'twilio/lib/rest/api/v2010/account/message';

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
        acc += `*Produto:* ${produto} | *Marca:* ${marca} | *Quantidade:* ${quantidade}`;
        acc += '\n';

        return acc;
      },
      '',
    );

    const twilio = twilioService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const stores = await this.storeRepository.find();

    if ((stores && stores.length === 0) || !stores) {
      throw new AppError("Platform doesn't have any stores yet", 404);
    }

    await this.orderRepository.save(newOrder);

    const messageOrder = (storeName: string, storeOrderId: number) =>
      `Boas vindas da *Uai Lista!* 😃😃😃 \n\n *${storeName}*, meu nome é *Gui* e verifiquei em meu sistema que a sua loja tem *um pedido* para analisar! \n\n *Pedido número:* ${storeOrderId} ${parsedOrderToMessage} \n \n *Por favor*, para *aceitar o pedido*, digite junto com o número do pedido o dígito *1* e para *negar o pedido*, digite junto com o número do pedido o dígito *0*. \n\n *Ex:* ${storeOrderId}:1 --> *aceitar* \n ${storeOrderId}:0 --> *negar* \n\n *Agradecemos* a sua *preferencia!* 🤝🤝🤝`;

    const { storeOrders, promissesMessageTwilio } = stores.reduce(
      (acc, store) => {
        acc.storeOrders.push(
          this.storeOrderRepository.create({
            order_id: newOrder.id,
            store_id: store.id,
            status: StatusShopOrderEnum.awaitingStore,
          }),
        );

        acc.promissesMessageTwilio.push(
          twilio.messages.create({
            body: messageOrder(store.name, Number(newOrder.order)),
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${store.whatsapp}`,
          }),
        );

        return acc;
      },
      {
        storeOrders: [] as StoreOrder[],
        promissesMessageTwilio: [] as Promise<MessageInstance>[],
      },
    );

    await Promise.all([
      promissesMessageTwilio,
      this.storeOrderRepository.save(storeOrders),
    ]);

    // const promissesMessageTwilio = stores.map(store =>
    //   twilio.messages.create({
    //     body: messageOrder(store.name),
    //     from: 'whatsapp:+14155238886',
    //     to: `whatsapp:${store.whatsapp}`,
    //   }),
    // );

    //const messages = await Promise.all(promissesMessageTwilio);

    return {
      id: newOrder.id,
      status: StatuOrderEnum[newOrder.status],
      created_at: newOrder.created_at,
    };
  }
}
