import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { ServerStatusError, ServerStatusErrorType, ServerStatusTracker } from '~/shared/server-status-tracker';
import { Logger } from '~/shared/logger';

const serviceErrorMessages = new Map<ServerStatusErrorType, string>([
  [ServerStatusErrorType.noConnection, 'Cannot reach the Made network.'],
  [ServerStatusErrorType.clientRequestError, 'Processing error, try again later.'],
  [ServerStatusErrorType.unknownServerError, 'Unknown error, try again later.'],
  [ServerStatusErrorType.internalServerError, 'Service error, try again later.']
]);

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

  subscription: Subscription;
  currentVisibleError: ServerStatusError;

  constructor(
    private logger: Logger,
    private serverStatus: ServerStatusTracker,
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

  handleServiceError(error: ServerStatusError): void {
    if (!error) {
      return;
    }

    this.logger.info('ServerStatusComponent.handleServiceError', error);

    const message = serviceErrorMessages.get(error.type);

    if (message) {
      if (this.currentVisibleError && this.currentVisibleError.type === error.type) {
        // Do not show duplicates while previous toast is still active. This helps to avoid
        // annoying the user.
        return;
      }
      this.currentVisibleError = error;

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
