import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Logger } from '~/shared/logger';

export enum ServerStatusErrorType {
  noConnection = 1,
  unauthorized,
  internalServerError,
  clientRequestError,
  unknownServerError
}

export interface ServerStatusError {
  type: ServerStatusErrorType;
}

/*
ServerStatusTracker - a singleton that serves as central dispatching and subscribing point
for all centrally handled server errors.

+------------+
| +------------+
| | +------------+
| | |            |         +---------------------+
| | |  Screen    |         |ServerStatusComponent|
+-+ |  Views     |         |                     |
  +-+            |         |       (Toast)       |
    +---+---+----+         +----------+----------+
        |   ^                         ^
        |   |response                 |
   get()|   |or                       |  notify
        |   |error                    |(Observable)
        v   |                         |
    +---+---+----+         +----------+-----------+
    |            |         |                      |
    |    Data    |         | ServerStatusTracker  |
    |   Stores   |         |                      |
    |            |         |                      |
    +---+---+----+         +----------+-----------+
        |   ^                         ^
        |   |response                 |
 request|   |or                       |
        |   |error                    |notify about
        v   |                         |general errors
    +---+---+----+                    |
  +-+            |                    |
+-+ |    API     +--------------------+
| | |  Services  |
| | |            |
| | +------------+
| +------------+
+------------+
          |
          | HTTP
          |
          v
        +-+ +
    +-+     +-+
   +           +--++
   ++  Backend    |
   ++             |
      +-+ +-+    +++
        +   + +--+

*/
@Injectable()
export class ServerStatusTracker {

  private subject = new BehaviorSubject<ServerStatusError>(undefined);

  constructor(
    private logger: Logger) { }

  /**
   * Notify observers about an error. Called by API services classes.
   */
  notify(error: ServerStatusError): void {
    this.logger.info('ServerStatusTracker.notify', error);
    this.subject.next(error);
  }

  /**
   * Used by views or anyone else who is interested in observing server error.
   */
  asObservable(): Observable<ServerStatusError> {
    return this.subject.asObservable();
  }
}
