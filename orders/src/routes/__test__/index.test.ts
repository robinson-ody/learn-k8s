import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';

const createTicket = async () => {
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();
  return ticket;
};

it('fetches orders for an particular user', async () => {
  // * create 3 tickets
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  // * create 2 users
  const userOne = global.signIn();
  const userTwo = global.signIn();

  // * create 1 order as user 1
  await request(app).post('/api/orders').set('Cookie', userOne).send({ ticketId: ticketOne.id }).expect(201);

  // * create 2 orders as user 2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // * make req to get orders for user 2
  const response = await request(app).get('/api/orders').set('Cookie', userTwo).expect(200);

  // * make sure we only got orders for user 2
  expect(response.body.length).toEqual(2);
  expect(response.body[0]).toEqual(orderOne);
  expect(response.body[1]).toEqual(orderTwo);
});
