import request from 'supertest';
import { app } from '../../app';

it('fails when email does not exist', async () => {
  await request(app).post('/api/user/sign-in').send({ email: 'asd@test.com', password: 'asdasd' }).expect(400);
});

it('fails when email and password does not match', async () => {
  await request(app).post('/api/user/sign-up').send({ email: 'test@test.com', password: 'password' }).expect(201);
  await request(app).post('/api/user/sign-in').send({ email: 'test@test.com', password: 'asdasd' }).expect(400);
});

it('sets a cookie if email and password match', async () => {
  await request(app).post('/api/user/sign-up').send({ email: 'test@test.com', password: 'password' }).expect(201);

  const response = await request(app)
    .post('/api/user/sign-in')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
