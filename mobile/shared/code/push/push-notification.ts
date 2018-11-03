import { Injectable } from '@angular/core';
import { NotificationEventResponse, Push, PushObject, PushOptions, RegistrationEventResponse } from '@ionic-native/push';

import { Logger } from '~/shared/logger';

import { ENV } from '~/environments/environment.default';
import { Page } from 'ionic-angular/navigation/nav-util';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { Events, Platform } from 'ionic-angular';
import { LoginEvent, SharedEventTypes } from '../events/shared-event-types';

export interface PrimingScreenParams {
  onAllowClick: Function;
  onNotNowClick: Function;
  onBackClick: Function;
}

// interface PersistentData {
//   device_registration_id: string;
// }

export enum PermissionScreenResult {
  notNeeded,
  permissionGranted,
  permissionNotGranted,
  userWantsToGoBack
}

export interface PersistentStorage {
  set(key: 'pushPermissionGranted', value: boolean): Promise<void>;
  get(key: 'pushPermissionGranted'): Promise<boolean>;
}

/**
 * Service that receives push notifications from backend.
 * See docs: https://ionicframework.com/docs/native/push/
 */
@Injectable()
export class PushNotification {
  private navCtrl: NavController;
  private primingScreenPage: Page;
  private userUuid: string;
  private deviceRegistrationId: string;

  constructor(
    private events: Events,
    private logger: Logger,
    private platform: Platform,
    private push: Push
  ) {
    if (!ENV.ffEnablePushNotifications) {
      return;
    }

    this.events.subscribe(SharedEventTypes.login, (e: LoginEvent) => this.onLogin(e));
    this.events.subscribe(SharedEventTypes.beforeLogout, () => this.onBeforeLogout());
  }

  /**
   * Initialize push notification. Must be called at the start of the app.
   * @param navCtrl to be used for showing permission priming screen.
   * @param primingScreenPage the screen that will be shown before we ask
   *    for system push permissions on iOS (ignore on Android).
   */
  async init(navCtrl: NavController, primingScreenPage: Page): Promise<void> {
    if (!ENV.ffEnablePushNotifications) {
      this.logger.info('Push: feature is not enabled.');
      return;
    }

    this.logger.info('Push: initializing.');

    this.navCtrl = navCtrl;
    this.primingScreenPage = primingScreenPage;

    if (this.platform.is('android')) {
    //   // Ask permission on android immediately, since it is granted automatically
    //   this.askSystemPermission();
    }
  }

  /**
   * Show a permission screen by pushig it to navigation stack.
   * If the user grants permission then ask system push permission.
   * If system permission is granted registers this device with
   * the backend to receive notifications.
   *
   * @param asRoot if true sets the permission screen as root otherwise
   *               pushes it to navigation stack (making "pop" possible).
   *
   * @returns
   *    notNeeded - if there is no need to show the permission screen. This can be the
   *                case if permission is already granted or we are running on Android.
   *
   *    userWantsToGoBack - if back button was clicked (only possible if asRoot=false)
   */
  showPermissionScreen(asRoot: boolean): Promise<PermissionScreenResult> {
    if (!ENV.ffEnablePushNotifications) {
      return Promise.resolve(PermissionScreenResult.notNeeded);
    }

    this.logger.info('Push: asking permission');

    /*if (this.platform.is('android')) {
      // Ask permission on android immediately, since it is granted automatically
      return Promise.resolve(PermissionScreenResult.notNeeded);
    } else */
    {
      // On iOS we use priming screen first to reduce rejection rate

      return new Promise(async (resolve, reject) => {
        const params: PrimingScreenParams = {
          onAllowClick: async () => {
            try {
              const result = await this.askSystemPermission();
              resolve(result ? PermissionScreenResult.permissionGranted : PermissionScreenResult.permissionNotGranted);
            } catch {
              reject();
            }
          },

          onNotNowClick: () => resolve(PermissionScreenResult.permissionNotGranted),
          onBackClick: () => resolve(PermissionScreenResult.userWantsToGoBack)
        };
        if (asRoot) {
          this.navCtrl.setRoot(this.primingScreenPage, { params });
        } else {
          this.navCtrl.push(this.primingScreenPage, { params });
        }
      });
    }
  }

  async askSystemPermission(): Promise<boolean> {
    if (!ENV.ffEnablePushNotifications) {
      return false;
    }

    try {
      if (!await this.push.hasPermission()) {
        this.logger.warn('Push: we do not have permission to send push notifications');
        return false;
      }
    } catch (e) {
      this.logger.error('Push: cannot get push notification permission:', e);
      return false;
    }

    this.logger.info('Push: permission granted');

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

    this.logger.info('Push: options set');

    // Start device registration
    pushObject.on('registration').subscribe((registration: RegistrationEventResponse) => this.onDeviceRegistration(registration));

    // Prepare to receive notifications
    pushObject.on('notification').subscribe((notification: NotificationEventResponse) => this.onNotification(notification));

    // Log push errors
    pushObject.on('error').subscribe(error => this.logger.error('Push: error with Push plugin', error));

    return true;
  }

  /**
   * Device registration handler. Called after the device is registered with Apple/Google.
   */
  private onDeviceRegistration(registration: RegistrationEventResponse): void {
    this.logger.info('Push: device registered:', registration.registrationId);
    this.deviceRegistrationId = registration.registrationId;
    if (this.userUuid) {
      // We have both device id and user id, associate them now.
      this.associateUserWithDevice();
    }
  }

  /**
   * Push notification handler. Called when we have a new message pushed to us.
   */
  private onNotification(notification: NotificationEventResponse): void {
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

  private onLogin(e: LoginEvent): void {
    this.userUuid = e.userUuid;
    this.associateUserWithDevice();
  }

  private onBeforeLogout(): void {
    // This is called before we logout, i.e. while we are still authenticated. It is improtant
    // because "unassociation" only works when the user is still authenticated.
    this.unAssociateUserWithDevice();
    this.userUuid = undefined;
  }

  private associateUserWithDevice(): void {
    if (!this.deviceRegistrationId) {
      // Device is not yet known, nothing can be done.
      return;
    }

    // Register device+user with backend
  }

  private unAssociateUserWithDevice(): void {
    if (!this.deviceRegistrationId) {
      // Device is not yet known, nothing can be done.
      return;
    }

    // Unregister device+user with backend
  }
}
