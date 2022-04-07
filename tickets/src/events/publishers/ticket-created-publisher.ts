import { Publisher, Subjects, TicketCreatedEvent } from '@robin-learn-k8s/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
}
