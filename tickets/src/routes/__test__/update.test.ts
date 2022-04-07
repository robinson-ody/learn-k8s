import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../model/ticket';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signIn())
    .send({ title: 'qwe', price: 10 })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).put(`/api/tickets/${id}`).send({ title: 'qwe', price: 10 }).expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signIn())
    .send({ title: 'qwe', price: 10 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signIn())
    .send({ title: 'asd', price: 20 })
    .expect(401);
});

it('returns a 400 if the provided title or price is invalid', async () => {
  const cookie = global.signIn();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'qwe', price: 10 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'asd', price: -10 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 20 })
    .expect(400);
});

it('updates the ticket if the provided inputs is valid', async () => {
  const cookie = global.signIn();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'qwe', price: 10 });
  const newTitle = 'asd';
  const newPrice = 20;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send();
  expect(ticketResponse.body.title).toEqual(newTitle);
  expect(+ticketResponse.body.price).toEqual(newPrice);
});

it('publishes an event', async () => {
  const cookie = global.signIn();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'qwe', price: 10 });
  const newTitle = 'asd';
  const newPrice = 20;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects an updates if the ticket is being reserved', async () => {
  const cookie = global.signIn();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'qwe', price: 10 });
  const ticket = await Ticket.findById(response.body.id);
  ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'asd', price: 20 })
    .expect(400);
});
