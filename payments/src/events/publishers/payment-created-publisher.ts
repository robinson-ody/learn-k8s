import { PaymentCreatedEvent, Publisher, Subjects } from '@robin-learn-k8s/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PAYMENT_CREATED;
}
