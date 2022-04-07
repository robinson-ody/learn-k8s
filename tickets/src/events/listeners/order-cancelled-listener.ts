import { Listener, NotFoundError, OrderCancelledEvent, Subjects } from '@robin-learn-k8s/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../model/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
  queueGroupName = queueGroupName;

  async onMessage(data: { id: string; version: number; ticket: { id: string } }, msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) throw new NotFoundError('Ticket not found');
    ticket.set({ orderId: undefined });

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });
    
    await ticket.save();
    msg.ack();
  }
}
