import { current_user, NotAuthorizedError, NotFoundError, require_auth } from '@robin-learn-k8s/common';
import express, { Request, Response } from 'express';
import { Order } from '../model/order';

const router = express.Router();

router.get('/api/orders/:orderId', current_user, require_auth, async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderId).populate('ticket');
  if (!order) throw new NotFoundError('Order not found.');
  if (order.userId !== req.current_user!.id) throw new NotAuthorizedError();
  res.send(order);
});

export { router as showOrdersRouter };
