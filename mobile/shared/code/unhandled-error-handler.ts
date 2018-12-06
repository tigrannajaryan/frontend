import { ApplicationRef, Injectable, Injector } from '@angular/core';
import { AlertButton, AlertController } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { ApiError } from '~/shared/api-errors';
import { Logger } from '~/shared/logger';
import { reportToSentry } from '~/shared/sentry';

enum UIAction {
  justAlert,
  showRestartAlert
}

function lineBreakToBrTag(str: string): string {
  return str ? str.replace(/\n/gm, '<br/>') : '';
}

/**
 * Custom unhandled error handler.
 * This handler class is installed in app.module.ts
 */
@Injectable()
export class UnhandledErrorHandler {

  initialHref = window.location.href;

  constructor(
    private logger: Logger,
    private alertCtrl: AlertController,
    private injector: Injector,
    private analytics: GoogleAnalytics
  ) { }

  /**
   * Called by Angular when an exception is not handled in the views, components, etc.
   * This is nice centralize place to handle all common errors.
   * See https://angular.io/api/core/ErrorHandler
   */
  handleError(error: any): void {
    const originalError = error;
    if (error.rejection) {
      // This is most likely an exception thrown from async function.
      error = error.rejection;
    }

    if (error instanceof ApiError) {
      // All API errors are handled by ServerStatusTracker, nothing else needs to be done
      // we just supress this errors here since they are already processed.
      return;
    }

    // Get string representation of the error
    const errorType = (error.constructor && error.constructor.name) ? `class=${error.constructor.name}` : 'Unknown class';
    const errorDescription = error.toString ? `(${error.toString()})` : '';

    // And log it
    this.logger.error('Unhandled exception:', errorType, errorDescription, error);

    // Report to GA
    this.analytics.trackException(`${errorType}: ${errorDescription}`, false)
      .catch(e => {
        // Ignore errors during reporting, there is nothing else we can do.
      });

    let errorMsg = 'Unknown error';
    if (error.stack) {
      errorMsg = `${errorMsg}\n${error.stack}`;
    }
    reportToSentry(error);

    if (originalError.message && /Error: Loading chunk \d+ failed/.test(originalError.message)) {
      // Chunk loading error. Show user friendly error mesage.
      this.showErrorMsg(UIAction.showRestartAlert, '', 'Oops! Something went wrong! We recommend restarting the app.');
    } else {
      // Show error popup (async)
      this.showErrorMsg(UIAction.justAlert, error.name, error.stack);
    }
  }

  private showErrorMsg(uiAction: UIAction, errorName: string, errorDetails?: string): void {
    // Do UI updates via setTimeout to work around known Angular bug:
    // https://stackoverflow.com/questions/37836172/angular-2-doesnt-update-view-after-exception-is-thrown)
    // Also force Application update via Application.tick().
    // This is the only way I found reliably results in UI showing the error.
    // Despite Angular team claims the bug is still not fixed in Angular 5.2.9.

    setTimeout(() => {
      errorName = lineBreakToBrTag(errorName);
      errorDetails = lineBreakToBrTag(errorDetails);

      if (uiAction === UIAction.justAlert) {
        this.popup(errorName, errorDetails, ['Dismiss']);
      } else if (uiAction === UIAction.showRestartAlert) {
        this.popup(errorName, errorDetails,
          [
            {
              text: 'Dismiss',
              role: 'cancel'
            },
            {
              text: 'Restart App',
              handler: () => { this.restartApp(); }
            }
          ]
        );
      }

      // Force UI update
      const appRef: ApplicationRef = this.injector.get(ApplicationRef);
      appRef.tick();
    });
  }

  private restartApp(): void {
    // Show splash screen (useful if your app takes time to load)
    // navigator.splashscreen.show();
    // Reload original app url (ie your index.html file)
    window.location.assign(this.initialHref);
  }

  private popup(title: string, msg: string, buttons: Array<AlertButton | string>): void {
    // Show an error message
    const alert = this.alertCtrl.create({
      subTitle: title,
      message: msg.replace(/\n/, '<br><br>').replace(/\n\s\s\s\s/img, '<br>-&nbsp;'),
      buttons
    });
    alert.present();
  }
}
