import { Injectable } from '@angular/core';
import { NotificationEventResponse, Push, PushObject, PushOptions, RegistrationEventResponse } from '@ionic-native/push';
import { ToastController } from 'ionic-angular';

import { Logger } from '~/shared/logger';

import { ENV } from '~/environments/environment.default';

// const FCM_PUSH_SENDER_ID = '17636556416';

/**
 * Service that receives push notifications from backend.
 * See docs: https://ionicframework.com/docs/native/push/
 */
@Injectable()
export class PushNotification {
  constructor(
    private logger: Logger,
    private push: Push,
    private toastCtrl: ToastController
  ) {
    this.init();
  }

  async init(): Promise<void> {
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

    // if (!this.platform.is('cordova')) {
    //   this.logger.warn('Push notifications not initialized. Cordova is not available - Run in physical device');
    //   return;
    // }

    // await this.push.createChannel({
    //   id: "testchannel1",
    //   description: "My first test channel",
    //   // The importance property goes from 1 = Lowest, 2 = Low, 3 = Normal, 4 = High and 5 = Highest.
    //   importance: 3
    // });

    // this.logger.info('Push channel created');

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

    pushObject.on('registration').subscribe((registration: RegistrationEventResponse) => this.onDeviceRegistration(registration));
    pushObject.on('notification').subscribe((notification: NotificationEventResponse) => this.onNotification(notification));

    pushObject.on('error').subscribe(error => this.logger.error('Error with Push plugin', error));
  }

  onDeviceRegistration(registration: RegistrationEventResponse): void {
    this.logger.info('Push: device registered:', registration.registrationId);
    // TODO - send device token to server
  }

  onNotification(notification: NotificationEventResponse): void {
    this.logger.info('push message received:', notification.message);
    // if user using app and push notification comes
    if (notification.additionalData.foreground) {
      // if application open, show popup

      const toast = this.toastCtrl.create({
        message: notification.message,
        duration: 5000,
        position: 'top',
        showCloseButton: true
      });

      toast.present();

      // const confirmAlert = this.alertCtrl.create({
      //   title: 'New Notification',
      //   message: notification.message,
      //   buttons: [{
      //     text: 'Ignore',
      //     role: 'cancel'
      //   }, {
      //     text: 'View',
      //     handler: () => {
      //       // TODO: Your logic here
      //       // this.nav.push(DetailsPage, { message: notification.message });
      //       this.logger.info('Notification View clicked.');
      //     }
      //   }]
      // });
      // confirmAlert.present();
    } else {
      // if user NOT using app and push notification comes
      // TODO: Your logic on click of push notification directly
      // this.nav.push(DetailsPage, { message: notification.message });
      this.logger.info('Push notification received in background');
    }
  }
}
