import { Injectable, OnDestroy } from '@angular/core';
import { Events, ToastController } from 'ionic-angular';
import { ToastOptions } from 'ionic-angular/components/toast/toast-options';

import { PushNotificationEventDetails, SharedEventTypes } from '~/shared/events/shared-event-types';

/**
 * Params that should be returned from PushNotificationToastService subscription.
 */
export interface PushNotificationHandlerParams {
  buttonText?: string;
  onClick?(): void | Promise<void>;
}

/**
 * Subscription callback:
 * |  this.pushNotificationToastService.subscribe(subscription: PushNotificationHandlerSubscription);
 */
export type PushNotificationHandlerSubscription =
  (details: PushNotificationEventDetails) => PushNotificationHandlerParams | void;

/**
 * A place where basic notifications handling happens:
 * 1. subscribe to push notification event,
 * 2. show a toast when notification happens,
 * 3. perform additional actions if needed.
 *
 * Some additional options (buttonText and onClick) can be provided by subscribing to the PushNotificationToastService:
 * |  this.pushNotificationToastService.subscribe(subscription: PushNotificationHandlerSubscription);
 * |  this.pushNotificationToastService.unsubscribe(subscription: PushNotificationHandlerSubscription);
 */
@Injectable()
export class PushNotificationToastService implements OnDestroy {
  static defaultToastParams = {
    cssClass: 'PushNotificationToast',
    duration: 5000,
    position: 'top',
    showCloseButton: true,
    closeButtonText: 'Close'
  };

  // We use it to retrieve additional params for the toast.
  // See handlePushNotificationEvent method below.
  protected handlerParamsSubscriptions = [];

  constructor(
    private events: Events,
    private toastCtrl: ToastController
  ) {
    this.events.subscribe(SharedEventTypes.pushNotification,
      (details: PushNotificationEventDetails) => this.handlePushNotificationEvent(details));
  }

  ngOnDestroy(): void {
    this.events.unsubscribe(SharedEventTypes.pushNotification);
  }

  /**
   * We just append our subscription to the array we have.
   * NOTE: use binded functions () => …
   */
  subscribe(subscription: PushNotificationHandlerSubscription): void {
    this.handlerParamsSubscriptions.push(subscription);
  }

  unsubscribe(subscription: PushNotificationHandlerSubscription): void {
    const idx = this.handlerParamsSubscriptions.indexOf(subscription);
    if (idx !== -1) {
      this.handlerParamsSubscriptions.splice(idx, 1);
    }
  }

  /**
   * This method shows a special push notification toast with some additional side effects provided by PushNotificationHandlerSubscription.
   */
  protected handlePushNotificationEvent(details: PushNotificationEventDetails): void {
    /**
     * This is the place where all the magic happens.
     * 1. We run subscriptions one by one providing PushNotificationEventDetails inside.
     * 2. We combine resulting PushNotificationHandlerParams returned from subscription call using Object.assign (spread operator).
     * 3. As a result we have an additional params provided by some of the subscriptions.
     *
     * NOTE: subscriptions are called one by one in the order of subscribing.
     */
    const handlerParams: PushNotificationHandlerParams =
      this.handlerParamsSubscriptions.reduce(
        (params: PushNotificationHandlerParams, subscription: PushNotificationHandlerSubscription) => {
          const newParams = subscription(details) || {};
          return { ...params, ...newParams };
        },
        {}
      );

    const toastOptions: ToastOptions = {
      ...PushNotificationToastService.defaultToastParams,
      closeButtonText: handlerParams.buttonText || PushNotificationToastService.defaultToastParams.closeButtonText,
      message: details.message
    };

    const toast = this.toastCtrl.create(toastOptions);
    if (handlerParams.onClick) {
      toast.onDidDismiss(handlerParams.onClick);
    }
    toast.present();
  }
}
