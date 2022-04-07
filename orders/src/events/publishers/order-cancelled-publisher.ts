import { OrderCancelledEvent, Publisher, Subjects } from '@robin-learn-k8s/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
}
