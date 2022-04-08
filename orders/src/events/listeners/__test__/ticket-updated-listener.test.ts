import { TicketUpdatedEvent } from '@robin-learn-k8s/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../model/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // * create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // * create and save a ticket
  const ticket = Ticket.build({ id: new Types.ObjectId().toHexString(), price: 10, title: 'Title #1' });
  await ticket.save();

  // * create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    price: 20,
    title: 'Title #2',
    userId: new Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };

  // * create a fake message object
  // @ts-ignore
  const message: Message = { ack: jest.fn() };

  // * return all of this stuff
  return { listener, data, message, ticket };
};

it('find, updates, and saves a ticket', async () => {
  jest.setTimeout(10000);
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);
});

it('acks the message', async () => {
  jest.setTimeout(10000);
  const { data, listener, message } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version', async () => {
  jest.setTimeout(10000);
  const { data, listener, message } = await setup();
  data.version = 1000;
  expect(async () => await listener.onMessage(data, message)).rejects.toThrow();
});
