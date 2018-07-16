import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { Logger } from '~/shared/logger';

/**
 * Custom unhandled error handler.
 * This handler class is installed in app.module.ts
 */
@Injectable()
export class UnhandledErrorHandler {

  constructor(
    private alertCtrl: AlertController,
    private logger: Logger
  ) {
  }

  /**
   * Called by Angular when an exception is not handled in the views, components, etc.
   * This is nice centralize place to handle all common errors.
   * See https://angular.io/api/core/ErrorHandler
   */
  handleError(error: Error): void {
    this.logger.error(error);

    setTimeout(() => {
      // TODO:
      // 1. log
      // 2. sentry
      // 3. analytics
      const alert = this.alertCtrl.create({
        title: 'An error occurred',
        subTitle: 'We are working on fixing it.',
        buttons: ['Dismiss']
      });
      alert.present();
    });
  }
}
