import { Listener, NotFoundError, OrderCreatedEvent, Subjects } from '@robin-learn-k8s/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../model/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.ORDER_CREATED;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // * find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // * if no ticket, throw
    if (!ticket) throw new NotFoundError('Ticket');

    // * mark the ticket as being reserved by setting it's order id property
    ticket.set({ orderId: data.id });

    // * save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    // * ack the message
    msg.ack();
  }
}
