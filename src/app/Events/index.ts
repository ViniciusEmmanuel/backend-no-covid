import { Event } from '../provider/EventsEmiter';

import { CancelationOrderTimout } from '../service/Order/CancelationOrderTimout';
import { StatuOrderEnum } from '../enum';
import { FastifyInstance } from 'fastify';
import { Store } from '../models/Store';
import { UpdateClientUserEvent } from './UpdateClientUserEvent';

interface Order {
  id: string;
  status: number;
  created_at: Date;
}

export class Events {
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  public async execute() {
    Event.on('new:order', (order: Order) => {
      setTimeout(() => {
        new CancelationOrderTimout().execute(order.id);
      }, 1000 * 60 * 11);
    });

    Event.on('updated:order', (order: Order, store: Store[]) => {
      console.log('Dentro do envento', order.status);

      switch (order.status) {
        case StatuOrderEnum.awaitingUserChoseStore:
          console.log('Dentro do envento Update');

          new UpdateClientUserEvent(this.app.websocketServer).execute(order.id);

          break;

        // case StatuOrderEnum.canceledForStoreTimeout.toString():
        //   break;

        // case StatuOrderEnum.awaitingUserChoseStore.toString():
        //   break;

        // case StatuOrderEnum.separation.toString():
        //   break;

        // case StatuOrderEnum.ready.toString():
        //   break;

        default:
          break;
      }
    });
  }
}
