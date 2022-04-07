import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

declare global {
  var sign_up: () => Promise<string[]>;
  var test_email: string;
}

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'TicketingDev123!()';
  mongo = await MongoMemoryServer.create();
  const mongo_uri = mongo.getUri();
  await mongoose.connect(mongo_uri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.test_email = 'test@test.com';

global.sign_up = async () => {
  const email = global.test_email;
  const password = 'password';

  const response = await request(app).post('/api/user/sign-up').send({ email, password }).expect(201);
  const cookie = response.get('Set-Cookie');
  return cookie;
};
