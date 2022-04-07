import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteEvent, OrderStatus, TicketUpdatedEvent } from '@robin-learn-k8s/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../model/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Order } from '../../../model/order';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {
  // * create a listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // * create and save a ticket
  const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), price: 10, title: 'Title #1' });
  await ticket.save();

  const order = Order.build({ status: OrderStatus.CREATED, userId: 'userId', expiresAt: new Date(), ticket });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = { orderId: order.id };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder?.status).toEqual(OrderStatus.CANCELLED);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish as jest.Mock).toHaveBeenCalled();
  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(eventData.id).toEqual(order.id);
});

it('ack the messag', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
