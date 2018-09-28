import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Severity } from '@sentry/shim';

import { ENV } from '~/environments/environment.default';
import { Logger } from '~/shared/logger';
import {
  ApiClientError,
  ApiError,
  ApiFieldAndNonFieldErrors,
  HttpStatus,
  ServerInternalError,
  ServerUnreachableError
} from '~/shared/api-errors';
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

  private static error2SeverityLevel(error: ApiError): Severity {
    if (error instanceof ServerInternalError) {
      return Severity.Fatal;
    } else if (error instanceof ServerUnreachableError) {
      return Severity.Warning;
    } else {
      return Severity.Error;
    }
  }

  private static shouldReportToSentry(error: ApiError): boolean {
    if (error instanceof ApiFieldAndNonFieldErrors) {
      // Don't report ApiFieldAndNonFieldErrors to Sentry.
      return false;
    }

    if (!ENV.production && error instanceof ServerUnreachableError) {
      // Don't report ServerUnreachableError to Sentry if it is not production.
      return false;
    }

    // Report everything else
    return true;
  }

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

    if (ServerStatusTracker.shouldReportToSentry(error)) {
      reportToSentry(error, ServerStatusTracker.error2SeverityLevel(error));
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
