import { Publisher, Subjects, TicketUpdatedEvent } from '@robin-learn-k8s/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TICKET_UPDATED;
}
