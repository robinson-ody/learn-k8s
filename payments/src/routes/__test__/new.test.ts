import { OrderStatus } from '@robin-learn-k8s/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../model/order';
// import { Payment } from '../../model/payment';
// import { stripe } from '../../stripe';

// jest.mock('../../stripe.ts');

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn())
    .send({ token: 'token', orderId: new mongoose.Types.ObjectId().toHexString() })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn())
    .send({ token: 'token', orderId: order.id })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.CANCELLED,
    userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(userId))
    .send({ orderId: order.id, token: 'token' })
    .expect(400);
});

// it.todo('returns a 201 with valid inputs');
// async () => {
// const userId = new mongoose.Types.ObjectId().toHexString();
// const price = Math.floor(Math.random() * 89 + 10);

// const order = Order.build({
//   id: new mongoose.Types.ObjectId().toHexString(),
//   price,
//   status: OrderStatus.CREATED,
//   userId,
//   version: 0,
// });

// await order.save();

// await request(app)
//   .post('/api/payments')
//   .set('Cookie', global.signIn(userId))
//   .send({ token: 'tok_visa', orderId: order.id })
//   .expect(201);

// const stripeCharges = await stripe.charges.list({ limit: 2 });
// const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 1000 * 100);
// expect(stripeCharge).toBeDefined();

// const payment = await Payment.findOne({orderId: order.id, stripeId: stripeCharge?.id})
// expect(payment).not.toBeNull()
// }
