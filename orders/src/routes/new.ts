import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../model/ticket';
import { Order, OrderStatus } from '../model/order';
import { BadRequestError, current_user, NotFoundError, require_auth, validate_request } from '@robin-learn-k8s/common';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  '/api/orders',
  current_user,
  require_auth,

  [
    body('ticketId')
      .exists({ checkFalsy: true })
      .withMessage('TicketId must be provided.')
      .bail()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId not valid.'),
  ],

  validate_request,

  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');
    const isReserved = await ticket.isReserved();
    if (isReserved) throw new BadRequestError('Ticket is already reserved.');
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    const order = Order.build({ userId: req.current_user!.id, status: OrderStatus.CREATED, ticket, expiresAt });
    await order.save();

    // * publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      expiresAt: order.expiresAt.toISOString(),
      status: order.status,
      userId: order.userId,
      version: order.version,

      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrdersRouter };
