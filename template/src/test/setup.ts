import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signIn: () => string[];
  var test_email: string;
}

jest.mock('../nats-wrapper.ts');
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
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.test_email = 'test@test.com';

global.signIn = () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = { id, email: 'random@email.com' };
  const access_token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { access_token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString('base64');
  return [`session=${base64}`];
};
