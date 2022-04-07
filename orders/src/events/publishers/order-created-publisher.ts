import { OrderCreatedEvent, Publisher, Subjects } from '@robin-learn-k8s/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.ORDER_CREATED;
}
