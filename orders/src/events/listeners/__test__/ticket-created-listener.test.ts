import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedEvent } from '@robin-learn-k8s/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../model/ticket';

const setup = async () => {
  // * create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // * create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: 'Title',
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };

  // * create a fake message object
  // @ts-ignore
  const message: Message = { ack: jest.fn() };

  return { listener, data, message };
};

it('creates and saves a ticket', async () => {
  const { listener, data, message } = await setup();

  // * call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  // * write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { data, listener, message } = await setup();

  // * call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  // * write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});
