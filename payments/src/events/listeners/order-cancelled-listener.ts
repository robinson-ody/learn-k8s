import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@robin-learn-k8s/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../model/order';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) throw new Error('Order not found.');
    order.set({ status: OrderStatus.CANCELLED });
    await order.save();
    msg.ack();
  }
}
