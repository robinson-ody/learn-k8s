import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../model/ticket';
import { Order, OrderStatus } from '../../model/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app).post('/api/orders').set('Cookie', global.signIn()).send({ ticketId }).expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();
  const order = Order.build({ expiresAt: new Date(), status: OrderStatus.CREATED, ticket, userId: 'userId1' });
  await order.save();
  await request(app).post('/api/orders').set('Cookie', global.signIn()).send({ ticketId: ticket.id }).expect(400);
});

it('reserved a ticket', async () => {
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();
  await request(app).post('/api/orders').set('Cookie', global.signIn()).send({ ticketId: ticket.id }).expect(201);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();
  await request(app).post('/api/orders').set('Cookie', global.signIn()).send({ ticketId: ticket.id }).expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
