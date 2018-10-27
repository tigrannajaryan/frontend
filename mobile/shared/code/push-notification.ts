import { Injectable } from '@angular/core';
import { NotificationEventResponse, Push, PushObject, PushOptions, RegistrationEventResponse } from '@ionic-native/push';

import { Logger } from '~/shared/logger';

import { ENV } from '~/environments/environment.default';

/**
 * Service that receives push notifications from backend.
 * See docs: https://ionicframework.com/docs/native/push/
 */
@Injectable()
export class PushNotification {
  private isInitCalled = false;

  constructor(
    private logger: Logger,
    private push: Push
  ) {
  }

  /**
   * Registers this device with the backend to receive notifications.
   * If this is the first time that we register this device then we will
   * ask for notification permission (if we don't already have it).
   *
   * This call has no effect if init() is already called (it is safe to call
   * init() multiple times).
   */
  async init(): Promise<void> {
    if (this.isInitCalled) {
      return;
    }

    this.isInitCalled = true;

    this.logger.info('Initializing PushNotification');

    try {
      if (!await this.push.hasPermission()) {
        this.logger.warn('We do not have permission to send push notifications');
        return;
      }
    } catch (e) {
      this.logger.error('Cannot get push notification permission:', e);
      return;
    }

    const channels = await this.push.listChannels();
    this.logger.info('Push channels:', channels);

    const options: PushOptions = {
      android: {
        senderID: ENV.FCM_PUSH_SENDER_ID
      },
      ios: {
        alert: 'true',
        badge: false,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);

    this.logger.info('Push options set');

    // Start device registration
    pushObject.on('registration').subscribe((registration: RegistrationEventResponse) => this.onDeviceRegistration(registration));

    // Prepare to receive notifications
    pushObject.on('notification').subscribe((notification: NotificationEventResponse) => this.onNotification(notification));

    // Log push errors
    pushObject.on('error').subscribe(error => this.logger.error('Push: error with Push plugin', error));
  }

  /**
   * Device registration handler. Called after the device is registered with Apple/Google.
   */
  onDeviceRegistration(registration: RegistrationEventResponse): void {
    this.logger.info('Push: device registered:', registration.registrationId);
    // TODO: send device registration id to backend
  }

  /**
   * Push notification handler. Called when we have a new message pushed to us.
   */
  onNotification(notification: NotificationEventResponse): void {
    this.logger.info('Push: message received:', notification.message);
    // if user using app and push notification comes
    if (notification.additionalData.foreground) {
      // TODO: if application is open show the notification somehow
      this.logger.info('Push: notification received in foreground');
    } else {
      // if user NOT using app and push notification comes
      // TODO: Your logic on click of push notification directly
      this.logger.info('Push: notification received in background');
    }
  }
}
