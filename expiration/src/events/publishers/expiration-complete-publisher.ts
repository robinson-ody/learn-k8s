import { Subjects, Publisher, ExpirationCompleteEvent } from '@robin-learn-k8s/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject: Subjects.EXPIRATION_COMPLETE = Subjects.EXPIRATION_COMPLETE;
}
