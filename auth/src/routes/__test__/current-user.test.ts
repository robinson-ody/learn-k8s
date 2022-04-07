import request from 'supertest';
import { app } from '../../app';

it('give back the details about the current user', async () => {
  const cookie = await global.sign_up();
  const response = await request(app).get('/api/user/current-user').set('Cookie', cookie).send().expect(400);
  expect(response.body.current_user.email).toEqual(global.test_email);
});

it('returns null if no cookie given', async () => {
  const response = await request(app).get('/api/user/current-user');
  expect(response.body.current_user).toEqual(null);
});
