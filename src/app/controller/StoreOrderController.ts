import { FastifyReply, FastifyRequest } from 'fastify';
import { UpdatedStatusOrderService } from '../service/StatusOrder/UpdatedStatusOrderService';

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

    console.log('POST TWILIO', request.body);

    const updatedStatusOrder = new UpdatedStatusOrderService();

    await updatedStatusOrder.execute({
      messageSid: MessageSid,
      bodyMessage: Body,
    });

    return response.status(200).send();
  }
}
