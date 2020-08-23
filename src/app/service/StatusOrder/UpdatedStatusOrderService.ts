import twilioService from 'twilio';

import { getRepository } from 'typeorm';
import { StoreOrder } from '../../models/StoreOrder';

import { isBefore, addMinutes } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { StatusShopOrderEnum, StatuOrderEnum } from '../../enum';
import { AppError } from '../../exceptions/AppErros';
import { Order } from '../../models/Order';
import { Store } from '../../models/Store';
import { Event } from '../../provider/EventsEmiter';

interface IUpdatedStatusOrder {
  from: string;
  bodyMessage: string;
}

export class UpdatedStatusOrderService {
  constructor(
    private storeOrderRepository = getRepository(StoreOrder),
    private orderRepository = getRepository(Order),
    private storeRepository = getRepository(Store),
  ) {}

  public async execute({ from, bodyMessage }: IUpdatedStatusOrder) {
    const [order] = String(bodyMessage).split(':');

    const originalOrder = await this.orderRepository.findOne({
      where: { order },
    });

    const [, whatsapp] = String(from).split(':');

    const store = await this.storeRepository.findOne({
      where: {
        whatsapp,
      },
    });

    if (!String(order).match(new RegExp(/\d+/g)) || !originalOrder) {
      throw new AppError('Not found store related order.', 404);
    }

    const storeOrder = await this.storeOrderRepository.findOne({
      relations: ['order', 'store'],
      where: {
        order_id: originalOrder.id,
        store_id: store?.id,
      },
    });

    if (!storeOrder) {
      throw new AppError('Not found store related order.', 404);
    }

    // pedido já cancelado retorna aviso
    if (storeOrder.status === StatusShopOrderEnum.refused) {
      await this.sendMessageTwilio(
        [storeOrder],
        `O pedido  *${storeOrder.order.order}* já foi recusado.`,
      );

      return;
    }

    // validar se o está dentro do tempo de 10 minutos de tolerancia

    const timeZone = process.env.TZ || 'America/Sao_Paulo';
    const parsedUTCDate = zonedTimeToUtc(new Date(), timeZone);
    const dateStoreOrderBefore10Minutes = addMinutes(
      storeOrder.order.created_at,
      10,
    );

    if (
      isBefore(dateStoreOrderBefore10Minutes, parsedUTCDate) &&
      storeOrder.status === StatusShopOrderEnum.awaitingStore
    ) {
      // Invalidar as lojas com esse pedido por tempo sem resposta

      storeOrder.status = StatusShopOrderEnum.canceledForTimeout;

      await this.storeOrderRepository.save(storeOrder);

      // avisar que o tempo para aceitar foi encerrado

      await this.sendMessageTwilio(
        [storeOrder],
        `O prazo para aceitar o pedido *${storeOrder.order.order}* foi encerrado.`,
      );

      return;
    }

    // apertou 0 cancela

    if (
      String(bodyMessage)
        .trim()
        .match(new RegExp(/\d+:[0]/g)) &&
      (storeOrder.order.status === StatuOrderEnum.pending ||
        storeOrder.order.status === StatuOrderEnum.awaitingUserChoseStore)
    ) {
      storeOrder.status = StatusShopOrderEnum.refused;

      await this.storeOrderRepository.save(storeOrder);

      await this.sendMessageTwilio(
        [storeOrder],
        `Pedido *${storeOrder.order.order}* recusado.`,
      );

      return;
    }

    // apertou 1 aceita o pedido

    // envia uma mesagem pedindo o preço

    if (
      String(bodyMessage)
        .trim()
        .match(new RegExp(/\d+:[1]/g)) &&
      (storeOrder.order.status === StatuOrderEnum.pending ||
        storeOrder.order.status === StatuOrderEnum.awaitingUserChoseStore) &&
      storeOrder.status === StatusShopOrderEnum.awaitingStore
    ) {
      storeOrder.status = StatusShopOrderEnum.acceptOrder;

      await this.storeOrderRepository.save(storeOrder);

      await this.sendMessageTwilio(
        [storeOrder],
        `Por favor envie o preço total referente ao pedido. \n *Ex:*  ${storeOrder.order.order}:100.`,
      );

      return;
    }

    if (
      storeOrder.status === StatusShopOrderEnum.acceptOrder &&
      String(bodyMessage)
        .trim()
        .match(new RegExp(/\d+:\d+/g))
    ) {
      const [, value] = String(bodyMessage).split(':');

      storeOrder.status = StatusShopOrderEnum.awaitingUser;
      storeOrder.value = value;

      const updatedStadusOrder = this.orderRepository.update(
        { id: storeOrder.order_id },
        {
          status: StatuOrderEnum.awaitingUserChoseStore,
        },
      );

      const updatedStadusStoreOrder = this.storeOrderRepository.save(
        storeOrder,
      );

      // informe que o cliente está escolhendo

      const updateMessageStore = this.sendMessageTwilio(
        [storeOrder],
        'O cliente foi informado do seu preço, aguarde sua confirmação.',
      );

      await Promise.all([
        updatedStadusOrder,
        updatedStadusStoreOrder,
        updateMessageStore,
      ]);

      console.log('aceitou o pedido e enviou o preço', storeOrder.store.name);

      Event.emit('updated:order', storeOrder.order);

      return;
    }

    if (storeOrder.status === StatusShopOrderEnum.awaitingUser) {
      await this.sendMessageTwilio(
        [storeOrder],
        'O cliente foi informado do seu preço, aguarde sua confirmação.',
      );

      return;
    }

    // Default
    await this.sendMessageTwilio([storeOrder], 'Não entendi sua menssagem.');
  }

  private async sendMessageTwilio(
    storeOrders: StoreOrder[] = [],
    message = '',
  ) {
    const twilio = twilioService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const promissesMessageTwilio = storeOrders.map(storeOrder =>
      twilio.messages.create({
        body: message,
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${storeOrder.store.whatsapp}`,
      }),
    );

    await Promise.all(promissesMessageTwilio);
  }
}
