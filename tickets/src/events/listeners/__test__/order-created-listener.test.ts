import { OrderCreatedEvent, OrderStatus } from '@robin-learn-k8s/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../model/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // * create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // * create and save a ticket
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', userId: 'asd' });
  await ticket.save();

  // * create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.CREATED,
    userId: 'asd',
    expiresAt: 'asd',

    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const message: Message = { ack: jest.fn() };

  return { listener, ticket, data, message };
};

it('sets the userId of the ticket', async () => {
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { data, listener, message } = await setup();
  await listener.onMessage(data, message);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
