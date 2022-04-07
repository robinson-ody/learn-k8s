import { PaymentCreatedEvent, Listener, OrderStatus, Subjects } from '@robin-learn-k8s/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../model/order';
import { natsWrapper } from '../../nats-wrapper';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { queueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PAYMENT_CREATED;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error('Order not found.');
    order.set({ status: OrderStatus.COMPLETE });
    await order.save();
    msg.ack();
  }
}
