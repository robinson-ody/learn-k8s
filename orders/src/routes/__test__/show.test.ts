import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';

it('fetches the order', async () => {
  // * create a ticket
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const user = global.signIn();

  // * make a req to build and order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // * make req to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder).toEqual(order);
});

it('returns an error if fetching the orders from another user', async () => {
  // * create a ticket
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const user = global.signIn();

  // * make a req to build and order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // * make req to fetch the order
  await request(app).get(`/api/orders/${order.id}`).set('Cookie', global.signIn()).send().expect(401);
});
