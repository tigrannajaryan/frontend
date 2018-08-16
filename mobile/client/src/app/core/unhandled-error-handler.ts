import { ApplicationRef, Injectable, Injector } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { reportToSentry } from '~/shared/sentry';

/**
 * Custom unhandled error handler.
 * This handler class is installed in app.module.ts
 */
@Injectable()
export class ClientUnhandledErrorHandler {

  constructor(
    private alertCtrl: AlertController,
    private injector: Injector,
    private logger: Logger
  ) { }

  /**
   * Called by Angular when an exception is not handled in the views, components, etc.
   * This is nice centralize place to handle all common errors.
   * See https://angular.io/api/core/ErrorHandler
   */
  handleError(error: any): void {
    // Log the error
    this.logger.error('Unhandled exception:', error);

    // Report to sentry
    reportToSentry(error);

    // Prepare the error message to show to the user
    let errorMsg = 'Unknown error';
    if (error.stack) {
      errorMsg = `${errorMsg}\n${error.stack}`;
    }

    this.showErrorMsg(errorMsg);
  }

  private showErrorMsg(errorMsg: string): void {
    // Do UI updates via setTimeout to work around known Angular bug:
    // https://stackoverflow.com/questions/37836172/angular-2-doesnt-update-view-after-exception-is-thrown)
    // Also force Application update via Application.tick().
    // This is the only way I found reliably results in UI showing the error.
    // Despite Angular team claims the bug is still not fixed in Angular 5.2.9.

    setTimeout(() => {
      errorMsg = errorMsg.replace(/\n/gm, '<br/>');
      this.popup(errorMsg);

      // Force UI update
      const appRef: ApplicationRef = this.injector.get(ApplicationRef);
      appRef.tick();
    });
  }

  private popup(msg: string): void {
    // Show an error message
    const alert = this.alertCtrl.create({
      subTitle: msg,
      buttons: ['Dismiss']
    });
    alert.present();
  }
}
