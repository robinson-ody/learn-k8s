import request from 'supertest';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@robin-learn-k8s/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../model/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { app } from '../../../app';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ price: 10, title: 'Ticket', userId: 'asd' });
  ticket.set({ orderId });
  await ticket.save();
  const data: OrderCancelledEvent['data'] = { id: orderId, ticket: { id: ticket.id }, version: ticket.version };

  // @ts-ignore
  const message: Message = { ack: jest.fn() };

  return { message, data, ticket, orderId, listener };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(message.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('returns 404 kalau ticket yang mau di-cancel tidak ada', async () => {
  // * create ticket
  const cookie = global.signIn();
  await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'Title #1', price: 10 });

  // * update ticket dengan id yang sembarang
  const response = await request(app)
    .put(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', cookie)
    .send({ price: 20, title: 'Ticket #2' });

  // * expect 404
  expect(response.status).toEqual(404);
});
