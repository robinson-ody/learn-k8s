import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  require_auth,
  validate_request,
} from '@robin-learn-k8s/common';

import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../model/order';
import { Payment } from '../model/payment';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
  '/api/payments',
  require_auth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validate_request,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found.');
    if (order.userId !== req.current_user?.id) throw new NotAuthorizedError();
    if (order.status === OrderStatus.CANCELLED) throw new BadRequestError('Order is alreay expired.');
    const charge = await stripe.charges.create({ currency: 'idr', amount: order.price * 100, source: token });
    const payment = Payment.build({ orderId, stripeId: charge.id });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
