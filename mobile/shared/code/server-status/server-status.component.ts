import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { Logger } from '~/shared/logger';
import {
  ApiClientError,
  ApiError,
  ApiFieldAndNonFieldErrors,
  HttpStatus,
  ServerInternalError,
  ServerUnknownError,
  ServerUnreachableError
} from '~/shared/api-errors';
import { showAlert } from '~/shared/utils/alert';
import { ApiFieldAndNonFieldErrors, NonFieldErrorItem } from '~/shared/api-errors';
import { LogoutAction } from '~/shared/storage/auth.reducer';

const toastDurationMs = 3000;

/**
 * A server status indicator component that visualizes the errors dispatched
 * by services.
 */
@Component({
  selector: 'server-status',
  templateUrl: 'server-status.component.html'
})
export class ServerStatusComponent implements OnInit, OnDestroy {

  // These errors resulted in logout:
  static tokenExpiredErrors: ApiFieldAndNonFieldErrors[] = [
    new ApiFieldAndNonFieldErrors([new NonFieldErrorItem({ code: 'err_signature_expired' })]),
    new ApiFieldAndNonFieldErrors([new NonFieldErrorItem({ code: 'err_refresh_expired' })]),
  ];

  subscription: Subscription;
  currentVisibleError: string;

  constructor(
    private logger: Logger,
    private serverStatus: ServerStatusTracker,
    private store: Store<{}>,
    private toastCtrl: ToastController) { }

  ngOnInit(): void {
    this.logger.info('ServerStatusComponent.ngOnInit');
    this.subscription = this.serverStatus.asObservable().subscribe(
      serviceError => {
        this.handleServiceError(serviceError);
      }
    );
  }

  ngOnDestroy(): void {
    this.logger.info('ServerStatusComponent.ngOnDestroy');
    this.subscription.unsubscribe();
  }

  handleServiceError(error: ApiError): void {
    if (!error) {
      return;
    }

    this.logger.info('ServerStatusComponent.handleServiceError', error);

    if (error instanceof ApiFieldAndNonFieldErrors) {

      // Some errors should result in logout:
      if (ServerStatusComponent.tokenExpiredErrors.some(e => error.isLike(e))) {
        this.store.dispatch(new LogoutAction());
      }

      // Show alert for ApiFieldAndNonFieldErrors
      let alertMsg = error.getMessage();
      alertMsg = alertMsg.replace(/\n/gm, '<br/>');
      showAlert('', alertMsg);
      return;
    }

    // Check if toast must be shown for remaining error types and compose the message for it

    let message;
    if (error instanceof ServerUnreachableError) {
      message = 'Cannot reach the Made network.';
    } else if (error instanceof ServerInternalError) {
      message = 'Service error, try again later.';
    } else if (error instanceof ServerUnknownError) {
      message = 'Unknown error, try again later.';
    } else if (error instanceof ApiClientError) {
      // HttpStatus.unauthorized is a normal case and is handled elsewhere, don't show toast for this status.
      if (error.status !== HttpStatus.unauthorized) {
        message = 'Processing error, try again later.';
      }
    }

    if (message) {
      if (this.currentVisibleError && this.currentVisibleError === message) {
        // Do not show duplicates while previous toast is still active. This helps to avoid
        // annoying the user.
        return;
      }
      this.currentVisibleError = message;

      const toast = this.toastCtrl.create({
        message,
        duration: toastDurationMs,
        position: 'top'
      });

      setTimeout(() => {
        this.currentVisibleError = undefined;
      }, toastDurationMs);

      toast.present();
    }
  }
}
