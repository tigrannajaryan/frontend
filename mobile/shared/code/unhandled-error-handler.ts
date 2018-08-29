import { ApplicationRef, Injectable, Injector } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { ApiError } from '~/shared/api-errors';
import { Logger } from '~/shared/logger';
import { reportToSentry } from '~/shared/sentry';

/**
 * Custom unhandled error handler.
 * This handler class is installed in app.module.ts
 */
@Injectable()
export class UnhandledErrorHandler {

  constructor(
    private logger: Logger,
    private alertCtrl: AlertController,
    private injector: Injector,
    private ga: GoogleAnalytics
  ) { }

  /**
   * Called by Angular when an exception is not handled in the views, components, etc.
   * This is nice centralize place to handle all common errors.
   * See https://angular.io/api/core/ErrorHandler
   */
  handleError(error: any): void {
    if (error.rejection) {
      // This is most likely an exception thrown from async function.
      error = error.rejection;
    }

    if (error instanceof ApiError) {
      // All API errors are handled by ServerStatusTracker, nothing else needs to be done
      // we just supress this errors here since they are already processed. The only
      // exception is ApiClientError with HttpStatus.unauthorized status.
      return;
    }

    // Get string representation of the error
    const errorType = (error.constructor && error.constructor.name) ? `class=${error.constructor.name}` : 'Unknown class';
    const errorDescription = error.toString ? `(${error.toString()})` : '';

    // And log it
    this.logger.error('Unhandled exception:', errorType, errorDescription, error);

    // Report to GA
    this.ga.trackException(`${errorType}: ${errorDescription}`, false)
      .catch(e => {
        // Ignore errors during reporting, there is nothing else we can do.
      });

    //   // Other server error. This should never happen unless we have bugs or
    //   // frontend calls an endpoint that doesn't exist, etc. Show detailed
    //   // error message for diagnostics.
    //   errorMsg = `Server error ${error.status}`;
    //   if (error.errorBody) {
    //     errorMsg = `${errorMsg}\n${JSON.stringify(error.errorBody)}`;
    //   }
    //

    let errorMsg = 'Unknown error';
    if (error.stack) {
      errorMsg = `${errorMsg}\n${error.stack}`;
    }
    reportToSentry(error);

    // Do UI updates via setTimeout to work around known Angular bug:
    // https://stackoverflow.com/questions/37836172/angular-2-doesnt-update-view-after-exception-is-thrown)
    // Also force Application update via Application.tick().
    // This is the only way I found reliably results in UI showing the error.
    // Despite Angular team claims the bug is still not fixed in Angular 5.2.9.

    setTimeout(() => this.showError(errorMsg));
  }

  private showError(errorMsg: string): void {
    errorMsg = errorMsg.replace(/\n/gm, '<br/>');
    this.popup(errorMsg);

    // Force UI update
    const appRef: ApplicationRef = this.injector.get(ApplicationRef);
    appRef.tick();
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
