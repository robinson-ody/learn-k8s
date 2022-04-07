import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app).post('/api/tickets').set('Cookie', global.signIn()).send({ title, price });
};

it('can fetch a list of tickets', async () => {
  await createTicket('qwe', 10);
  await createTicket('asd', 20);
  await createTicket('zxc', 30);

  const response = await request(app).get('/api/tickets').send().expect(200);
  expect(response.body.length).toEqual(3);
});
