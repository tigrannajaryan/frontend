import { ApplicationRef, Injectable, Injector } from '@angular/core';
import { AlertController, NavControllerBase } from 'ionic-angular';

/*
Sentry is disabled for now because the iOS release is failing.
We will work on a fix later.
More details on the problem: https://github.com/madebeauty/monorepo/issues/316

import * as Sentry from 'sentry-cordova';
*/

import {
  HttpStatus,
  ServerErrorResponse,
  ServerFieldError,
  ServerNonFieldError,
  ServerUnreachableOrInternalError
} from './api-errors';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ServerReachabilityAction } from '~/shared/server-status/server-status.reducer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

enum ErrorUIAction {
  showAlert,
  redirectToFirstPage,
  markServerUnreachable
}

/**
 * Custom unhandled error handler.
 * This handler class is installed in app.module.ts
 */
@Injectable()
export class UnhandledErrorHandler {

  private nav: NavControllerBase;
  private firstPageName: string;

  private static reportToSentry(error: any): void {
    /*
    Sentry is disabled for now because the iOS release is failing.
    We will work on a fix later.
    More details on the problem: https://github.com/madebeauty/monorepo/issues/316

    try {
      Sentry.captureException(error.originalError || error);
    } catch (e) {
      console.error(e);
    }
    */
  }

  constructor(
    private logger: Logger,
    private alertCtrl: AlertController,
    protected serverStatus: ServerStatusTracker,
    private injector: Injector,
    private ga: GoogleAnalytics
  ) { }

  init(nav: NavControllerBase, firstPageName: string): void {
    this.nav = nav;
    this.firstPageName = firstPageName;
  }

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

    // Based on error type decide how to report it to Sentry and how to show it in the UI
    let errorUIAction: ErrorUIAction;
    let errorMsg = '';

    if (error instanceof ServerNonFieldError) {
      errorMsg = error.getStr();
      errorUIAction = ErrorUIAction.showAlert;
    } else if (error instanceof ServerFieldError) {
      // This case should never end up here, it should be properly
      // handled by each specific screen and the incorrect fields
      // should be highlighted in the UI.
      errorMsg = 'Error in the input fields';
      errorUIAction = ErrorUIAction.showAlert;
    } else if (error instanceof ServerErrorResponse && error.status === HttpStatus.unauthorized) {
      // Erase all previous navigation history and make LoginPage the root
      errorUIAction = ErrorUIAction.redirectToFirstPage;
    } else if (error instanceof ServerUnreachableOrInternalError) {
      // Update server status. This will result in server status error banner to appear.
      errorUIAction = ErrorUIAction.markServerUnreachable;
      UnhandledErrorHandler.reportToSentry(error);
    } else {
      errorMsg = 'Unknown error';
      errorUIAction = ErrorUIAction.showAlert;
      UnhandledErrorHandler.reportToSentry(error);
    }

    // Do UI updates via setTimeout to work around known Angular bug:
    // https://stackoverflow.com/questions/37836172/angular-2-doesnt-update-view-after-exception-is-thrown)
    // Also force Application update via Application.tick().
    // This is the only way I found reliably results in UI showing the error.
    // Despite Angular team claims the bug is still not fixed in Angular 5.2.9.

    setTimeout(() => this.performUIAction(errorUIAction, errorMsg));
  }

  private performUIAction(action: ErrorUIAction, errorMsg: string): void {
    switch (action) {
      case ErrorUIAction.showAlert:
        this.popup(errorMsg);
        break;

      case ErrorUIAction.redirectToFirstPage:
        // Erase all previous navigation history and make LoginPage the root
        this.nav.setRoot(this.firstPageName);
        break;

      case ErrorUIAction.markServerUnreachable:
        // Update server status. This will result in server status error banner to appear.
        this.serverStatus.dispatch(new ServerReachabilityAction(false));
        break;

      default:
    }

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
