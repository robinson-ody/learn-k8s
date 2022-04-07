import { Subjects } from '@robin-learn-k8s/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../model/order';
import { Ticket } from '../../model/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('marks an order as cancelled', async () => {
  // * create a ticket with Ticket Model
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const user = global.signIn();

  // * make a req to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // * make a req to cancel the order
  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

  // * expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder?.status).toEqual(OrderStatus.CANCELLED);
});

it('emits an order cancelled event', async () => {
  // * create a ticket with Ticket Model
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const user = global.signIn();

  // * make a req to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // * make a req to cancel the order
  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
