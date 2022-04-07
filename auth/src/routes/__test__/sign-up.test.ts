import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful sign up', async () => {
  await request(app).post('/api/user/sign-up').send({ email: 'test@test.com', password: 'password' }).expect(201);
});

it('returns a 400 with an invalid email', async () => {
  await request(app).post('/api/user/sign-up').send({ email: 'test.com', password: 'password' }).expect(400);
});

it('returns a 400 with an invalid password', async () => {
  await request(app).post('/api/user/sign-up').send({ email: 'test.com', password: '1' }).expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app).post('/api/user/sign-up').send({}).expect(400);
});

it('diallows duplicate email', async () => {
  await request(app).post('/api/user/sign-up').send({ email: 'test@test.com', password: 'password' }).expect(201);

  await request(app)
    .post('/api/user/sign-up')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(res => res.text.includes('Email is already in use.'));
});

it('sets a cookie after a successful signup', async () => {
  const response = await request(app)
    .post('/api/user/sign-up')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
