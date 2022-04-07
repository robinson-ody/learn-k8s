import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../model/ticket';

import {
  validate_request,
  NotFoundError,
  require_auth,
  NotAuthorizedError,
  current_user,
  BadRequestError,
} from '@robin-learn-k8s/common';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  current_user,
  require_auth,

  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be provided and must be greater than 0'),
  ],

  validate_request,

  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new NotFoundError('Ticket not found.');
    if (ticket.orderId) throw new BadRequestError('Cannot edit a reserved ticket.');
    if (ticket.userId !== req.current_user?.id) throw new NotAuthorizedError();
    ticket.set({ title: req.body.title, price: req.body.price });
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
