import { Injectable } from '@angular/core';
import * as Sentry from 'sentry-cordova';

import { Logger } from '~/shared/logger';
import { GAWrapper } from '~/shared/google-analytics';

/**
 * A common user context used by the app. Propagates user id to GA and Sentry.
 */
@Injectable()
export class UserContext {
  private userId: string;

  constructor(
    private ga: GAWrapper,
    private logger: Logger
  ) {
  }

  setUserId(userId: string): void {
    if (this.userId !== userId) {
      this.userId = userId;
      this.logger.info(`Current user is ${userId}`);
      this.ga.setUserId(userId);
      Sentry.setUserContext({ id: userId });
    }
  }
}
