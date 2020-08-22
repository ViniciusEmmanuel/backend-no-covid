import twilioService from 'twilio';

import { getRepository } from 'typeorm';
import { StoreOrder } from '../../models/StoreOrder';

import { isBefore, addMinutes } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { StatusShopOrderEnum, StatuOrderEnum } from '../../enum';
import { AppError } from '../../exceptions/AppErros';
import { Order } from '../../models/Order';

interface IUpdatedStatusOrder {
  messageSid: string;
  bodyMessage: string;
}

export class UpdatedStatusOrderService {
  constructor(
    private storeOrderRepository = getRepository(StoreOrder),
    private orderRepository = getRepository(Order),
  ) {}

  public async execute({ messageSid, bodyMessage }: IUpdatedStatusOrder) {
    const storeOrder = await this.storeOrderRepository.findOne({
      relations: ['order', 'store'],
      where: { message_twilio_sid: messageSid },
    });

    if (!storeOrder) {
      throw new AppError('Not found store related order.', 404);
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

      await this.storeOrderRepository.update(
        {
          order_id: storeOrder.order.id,
          status: StatusShopOrderEnum.awaitingStore,
        },
        { status: StatusShopOrderEnum.canceledForTimeout },
      );

      // avisar que o tempo para aceitar foi encerrado

      await this.sendMessageTwilio(
        [storeOrder],
        'O prazo para aceitar o pedido foi encerrado.',
      );

      return;
    }

    // apertou 0 cancela

    if (String(bodyMessage).trim() === '0') {
      storeOrder.status = StatusShopOrderEnum.refused;

      await this.storeOrderRepository.save(storeOrder);

      await this.sendMessageTwilio([storeOrder], 'Pedido recusado.');

      return;
    }

    // apertou 1 aceita o pedido

    // envia uma mesagem pedindo o preço

    if (String(bodyMessage).trim() === '1') {
      storeOrder.status = StatusShopOrderEnum.acceptOrder;

      await this.storeOrderRepository.save(storeOrder);

      await this.sendMessageTwilio(
        [storeOrder],
        'Por favor envie o preço total referente a lista de compra. \n Somente numeros são aceitos.',
      );

      return;
    }

    if (
      storeOrder.status === StatusShopOrderEnum.acceptOrder &&
      String(bodyMessage)
        .trim()
        .match(new RegExp(/[0-9]+/g))
    ) {
      storeOrder.status = StatusShopOrderEnum.awaitingUser;

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
