import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import * as Sentry from 'sentry-cordova';

import { Logger } from '~/shared/logger';

/**
 * A common user context used by the app. Propagates user id to GA and Sentry.
 */
@Injectable()
export class UserContext {
  private userId: string;

  constructor(
    private ga: GoogleAnalytics,
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
