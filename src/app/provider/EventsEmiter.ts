import events from 'events';

class EventsEmiter {
  constructor(private eventEmiter = new events.EventEmitter()) {}

  public on(event: string, functionAfterlister: (...args: any[]) => void) {
    this.eventEmiter.on(event, functionAfterlister);
  }

  public once(event: string, functionAfterlister: (...args: any[]) => void) {
    this.eventEmiter.once(event, functionAfterlister);
  }

  public emit(event: string, data: any = {}) {
    this.eventEmiter.emit(event, data);
  }
}

export const Event = new EventsEmiter();
