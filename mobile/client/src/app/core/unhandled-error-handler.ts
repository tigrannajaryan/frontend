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

    // Show error popup (async)
    this.showErrorMsg(error.name, error.message);
  }

  private showErrorMsg(errorName: string, msg?: string): void {
    // Do UI updates via setTimeout to work around known Angular bug:
    // https://stackoverflow.com/questions/37836172/angular-2-doesnt-update-view-after-exception-is-thrown)
    // Also force Application update via Application.tick().
    // This is the only way I found reliably results in UI showing the error.
    // Despite Angular team claims the bug is still not fixed in Angular 5.2.9.

    setTimeout(() => {
      errorName = errorName.replace(/\n/gm, '<br/>');
      this.popup(errorName, msg);

      // Force UI update
      const appRef: ApplicationRef = this.injector.get(ApplicationRef);
      appRef.tick();
    });
  }

  private popup(title: string, msg = ''): void {
    // Show an error message
    const alert = this.alertCtrl.create({
      subTitle: title,
      message: msg.replace(/\n/, '<br><br>').replace(/\n\s\s\s\s/img, '<br>-&nbsp;'),
      buttons: ['Dismiss']
    });
    alert.present();
  }
}
