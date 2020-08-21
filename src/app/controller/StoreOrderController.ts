import { FastifyReply, FastifyRequest } from 'fastify';

import twilioService from 'twilio';
import { getRepository } from 'typeorm';
import { StoreOrder } from '../models/StoreOrder';
import { Order } from '../models/Order';

interface ResponseTwilio {
  SmsMessageSid: string;
  NumMedia: string;
  SmsSid: string;
  SmsStatus: string;
  Body: string;
  To: string;
  NumSegments: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
}

export class StoreOrderController {
  public async store(request: FastifyRequest, response: FastifyReply) {
    const { MessageSid, Body } = request.body as ResponseTwilio;

    const storeOrderRepository = getRepository(StoreOrder);

    const findStoreOrder = await storeOrderRepository.findOne({
      where: { message_twilio_sid: MessageSid },
    });

    if (!findStoreOrder) {
      return;
    }

    const orderRepository = getRepository(Order);

    const order = await orderRepository.findOne(findStoreOrder.order_id);

    if (order && !order.store_id) {
    }

    console.log('RETORNO DE MENSSAGEM DA LOJA:', MessageSid, Body);
  }
}
