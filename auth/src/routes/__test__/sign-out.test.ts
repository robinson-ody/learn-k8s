import request from 'supertest';
import { app } from '../../app';

it('clear all the cookies on logout', async () => {
  await request(app).post('/api/user/sign-up').send({ email: 'test@test.com', password: 'password' }).expect(201);
  const response = await request(app).post('/api/user/sign-out').expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
