import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
/*
Sentry is disabled for now because the iOS release is failing.
We will work on a fix later.
More details on the problem: https://github.com/madebeauty/monorepo/issues/316

import * as Sentry from 'sentry-cordova';
*/

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
      /*
      Sentry is disabled for now because the iOS release is failing.
      We will work on a fix later.
      More details on the problem: https://github.com/madebeauty/monorepo/issues/316
      Sentry.setUserContext({ id: userId });
      */
    }
  }
}
