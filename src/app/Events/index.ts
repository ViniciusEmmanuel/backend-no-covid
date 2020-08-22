import { Event } from '../provider/EventsEmiter';

import { CancelationOrderTimout } from '../service/Order/CancelationOrderTimout';
import { StatuOrderEnum } from '../enum';

interface Order {
  id: string;
  status: string;
  created_at: Date;
}

Event.once('new:order', (order: Order) => {
  setTimeout(() => {
    new CancelationOrderTimout().execute(order.id);
  }, 1000 * 60 * 11);
});

Event.once('updated:order', (order: Order) => {
  // disparar o web socket avisando o status do pedido

  switch (order.status) {
    case StatuOrderEnum.canceledForStoreTimeout.toString():
      break;

    case StatuOrderEnum.awaitingUserChoseStore.toString():
      break;

    case StatuOrderEnum.separation.toString():
      break;

    case StatuOrderEnum.ready.toString():
      break;

    default:
      break;
  }
});
