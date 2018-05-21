import { ApplicationRef, Injectable, Injector } from '@angular/core';
import { AlertController, NavControllerBase } from 'ionic-angular';

import {
  HttpStatus,
  ServerErrorResponse,
  ServerFieldError,
  ServerNonFieldError,
  ServerUnreachableOrInternalError
} from './api-errors';

import { PageNames } from './page-names';
import { Logger } from './logger';
import { ServerStatusTracker } from './server-status-tracker';
import { ServerReachabilityAction } from './components/server-status/server-status.reducer';

/**
 * Custom unhandled error handler.
 * This handler class is installed in app.module.ts
 */
@Injectable()
export class UnhandledErrorHandler {

  private nav: NavControllerBase;

  constructor(
    private logger: Logger,
    private alertCtrl: AlertController,
    protected serverStatus: ServerStatusTracker,
    private injector: Injector
  ) { }

  setNavCtrl(nav: NavControllerBase): void {
    this.nav = nav;
  }

  popup(msg: string): void {
    // Show an error message
    const alert = this.alertCtrl.create({
      subTitle: msg,
      buttons: ['Dismiss']
    });
    alert.present();
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
    this.logger.error('Unhandled exception:', error);

    // Do updates via setTimeout to work around known Angular bug:
    // https://stackoverflow.com/questions/37836172/angular-2-doesnt-update-view-after-exception-is-thrown)
    // Also force Application update via Application.tick().
    // This is the only way I found reliably results in UI showing the error.
    // Despite Angular team claims the bug is still not fixed in Angular 5.2.9.

    setTimeout(() => {

      if (error instanceof ServerNonFieldError) {
        this.popup(error.getStr());
      } else if (error instanceof ServerFieldError) {
        // This case should never end up here, it should be properly
        // handled by each specific screen and the incorrect fields
        // should be highlighted in the UI.
        this.popup('Error in the input fields');
      } else if (error instanceof ServerErrorResponse && error.status === HttpStatus.unauthorized) {
        // Erase all previous navigation history and make LoginPage the root
        this.nav.setRoot(PageNames.FirstScreen);
      } else if (error instanceof ServerUnreachableOrInternalError) {
        // Update server status. This will result in server status error banner to appear.
        this.serverStatus.dispatch(new ServerReachabilityAction(false));
      } else {
        this.popup('Unknown error');
      }

      // Force UI update
      const appRef: ApplicationRef = this.injector.get(ApplicationRef);
      appRef.tick();
    });
  }
}
