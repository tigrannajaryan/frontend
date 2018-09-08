import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Severity } from '@sentry/shim';

import { Logger } from '@madebeauty/utils';

import { ApiClientError, ApiError, ApiFieldAndNonFieldErrors, HttpStatus, ServerUnreachableOrInternalError } from '~/shared/api-errors';
import { reportToSentry } from '~/shared/sentry';

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

  private subject = new BehaviorSubject<ApiError>(undefined);

  private firstPageName: string;
  private onUnauthorized: () => any;

  constructor(
    private app: App,
    private logger: Logger) { }

  init(firstPageName: string, onUnauthorized?: () => (Promise<void> | void)): void {
    this.firstPageName = firstPageName;
    this.onUnauthorized = onUnauthorized;
  }

  /**
   * Notify observers about an error. Called by API services classes.
   */
  notify(error: ApiError): void {
    this.logger.info('ServerStatusTracker.notify', error);

    if (error instanceof ApiClientError && error.status === HttpStatus.unauthorized) {
      this.logger.info('ServerStatusTracker: got HttpStatus.unauthorized, redirecting to first page.');

      // Erase all previous navigation history and make LoginPage the root
      const [nav] = this.app.getRootNavs();
      nav.setRoot(this.firstPageName);

      // Callback for some additional work:
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }

      // Don't notify the observers or Sentry since we fully handled this case.
      return;
    }

    if (!(error instanceof ApiFieldAndNonFieldErrors)) {
      // Report everything except ApiFieldAndNonFieldErrors to Sentry.
      // ServerUnreachableOrInternalError is reported as "Fatal" severity level.
      const level = (error instanceof ServerUnreachableOrInternalError) ? Severity.Fatal : Severity.Error;
      reportToSentry(error, level);
    }

    // Notify observers about the error.
    this.subject.next(error);
  }

  /**
   * Used by views or anyone else who is interested in observing server error.
   */
  asObservable(): Observable<ApiError> {
    return this.subject.asObservable();
  }
}
