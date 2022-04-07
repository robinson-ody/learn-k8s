import { Listener, Subjects, TicketCreatedEvent } from '@robin-learn-k8s/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../model/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { title, price, id } = data;
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();
    msg.ack();
  }
}
