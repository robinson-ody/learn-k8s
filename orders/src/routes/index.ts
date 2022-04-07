import { current_user, require_auth } from '@robin-learn-k8s/common';
import express, { Request, Response } from 'express';
import { Order } from '../model/order';

const router = express.Router();

router.get('/api/orders', current_user, require_auth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.current_user!.id }).populate('ticket');
  res.send(orders);
});

export { router as indexOrdersRouter };
