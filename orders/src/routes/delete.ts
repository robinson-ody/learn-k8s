import { current_user, NotAuthorizedError, NotFoundError, require_auth } from '@robin-learn-k8s/common';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { Order, OrderStatus } from '../model/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId', current_user, require_auth, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate('ticket');
  if (!order) throw new NotFoundError('Order not found');
  if (order.userId !== req.current_user!.id) throw new NotAuthorizedError();
  order.status = OrderStatus.CANCELLED;
  await order.save();

  // * publish an event saying that this order was cancelled
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    ticket: { id: order.ticket.id },
    version: order.version,
  });

  res.status(204).send(order);
});

export { router as deleteOrdersRouter };
