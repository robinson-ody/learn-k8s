import express, { Request, Response } from 'express';
import { current_user, require_auth, validate_request } from '@robin-learn-k8s/common';
import { body } from 'express-validator';
import { Ticket } from '../model/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  current_user,
  require_auth,

  [
    body('title').not().isEmpty().withMessage('Title is required.'),
    body('price').isInt({ min: 0 }).withMessage('Price invalid.'),
  ],

  validate_request,

  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const id = req.current_user!.id;
    const newTicket = Ticket.build({ price, title, userId: id });
    await newTicket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: newTicket.id,
      title: newTicket.title,
      price: newTicket.price,
      userId: newTicket.userId,
      version: newTicket.version,
    });
    
    res.status(201).json(newTicket);
  }
);

export { router as createTicketRouter };
