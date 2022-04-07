import { NotFoundError } from '@robin-learn-k8s/common';
import express, { Request, Response } from 'express';
import { Ticket } from '../model/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new NotFoundError('Ticket not found.');
  res.send(ticket);
});

export { router as showTicketRouter };
