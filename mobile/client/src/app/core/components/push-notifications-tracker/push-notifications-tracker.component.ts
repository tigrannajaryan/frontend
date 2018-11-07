import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events, Nav, ToastController } from 'ionic-angular';
import { ToastOptions } from 'ionic-angular/components/toast/toast-options';

import {
  PushNotificationCode,
  pushNotificationEvent,
  PushNotificationEventDetails
} from '~/shared/push/push-notification';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';

import { TabIndex } from '~/main-tabs/main-tabs.component';

/**
 * A place where basic notifications handling happens:
 * 1. subscribe to pushNotificationEvent,
 * 2. show a toast when notification happens,
 * 3. perform additional actions if needed.
 */
@Component({
  selector: 'push-notifications-tracker',
  // We only show toasts in the component, no template needed:
  template: ''
})
export class PushNotificationsTrackerComponent implements OnInit, OnDestroy {
  static toastCssClass = 'PushNotificationToast';
  static toastVisibleDurationMs = 5000;

  // We have to pass Nav as a param because of using this component inside app.component.
  // Nav is needed for navigation side-effects on push notification received.
  @Input() nav: Nav;

  constructor(
    private events: Events,
    private toastCtrl: ToastController
  ) {
  }

  ngOnInit(): void {
    this.events.subscribe(pushNotificationEvent, this.handlePushNotificationEvent);
  }

  ngOnDestroy(): void {
    this.events.unsubscribe(pushNotificationEvent);
  }

  private handlePushNotificationEvent = (details: PushNotificationEventDetails): void => {
    // Configure toast:
    const toastOptions: ToastOptions = {
      message: details.message,
      cssClass: PushNotificationsTrackerComponent.toastCssClass,
      duration: PushNotificationsTrackerComponent.toastVisibleDurationMs,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Close' // as a default
    };

    let onDidDismiss: () => void | Promise<void>;

    // Put the differencies between notifications in the switch/case:
    switch (details.code) {

      case PushNotificationCode.hint_to_first_book:
        toastOptions.closeButtonText = 'Book';
        onDidDismiss = async (): Promise<void> => {
          await this.nav.setRoot(PageNames.MainTabs);
          this.events.publish(ClientEventTypes.selectMainTab, TabIndex.Home);
        };
        break;

      default:
        break;
    }

    // Now show toast:
    const toast = this.toastCtrl.create(toastOptions);
    if (onDidDismiss) {
      toast.onDidDismiss(onDidDismiss);
    }
    toast.present();
  };
}
