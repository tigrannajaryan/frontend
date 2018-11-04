import { Injectable } from '@angular/core';
import { NotificationEventResponse, Push, PushObject, PushOptions, RegistrationEventResponse } from '@ionic-native/push';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';

import { ENV } from '~/environments/environment.default';
import { Page } from 'ionic-angular/navigation/nav-util';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { Events, Platform } from 'ionic-angular';
import { AfterLoginEvent, SharedEventTypes } from '../events/shared-event-types';

/**
 * Expected params of priming screen. When you implement the actual priming screen
 * make sure to use this interface for "params" NavParam property.
 */
export interface PrimingScreenParams {
  onAllowClick: Function;
  onNotNowClick: Function;
  onBackClick: Function;
}

/**
 * Resulting value returned by showPermissionScreen() method.
 */
export enum PermissionScreenResult {
  notNeeded,            // if there is no need to show the permission screen. This can be the
  //                       case if permission is already granted or we are running on Android.

  permissionGranted,    // push permission granted and device is now registered for push.
  permissionNotGranted, // push permission not granted, we cannot receive notifications.
  userWantsToGoBack     // back button was clicked (only possible if asRoot=false)
}

// Define minimum interval between bothering the user by priming screen
const minTimeBetweenPrimingScreenDisplaysMilliseconds = moment.duration(14, 'day').asMilliseconds();

/**
 * Data that PushNotification class needs to store persistently.
 */
export interface PushPersistentData {
  isPermissionGranted: boolean;
  lastPrimingScreenShown: Date;
}

/**
 * An interface that user of PushPersistent must implement and supply
 * in the call to PushPersistent.init() method. get/set funuction
 * signatures are compatible with generic AppStorage class which makes
 * it trivial to satisfy the requirements of this interface by simply
 * declaring "push_notification_params: PushPersistentData" member in
 * your app's persistent storage.
 */
export interface PersistentStorage {
  set(key: 'push_notification_params', value: PushPersistentData): Promise<void>;
  get(key: 'push_notification_params'): PushPersistentData;
}

/**
 * Service that receives push notifications from backend.
 * See docs: https://ionicframework.com/docs/native/push/
 */
@Injectable()
export class PushNotification {
  private navCtrl: NavController;
  private primingScreenPage: Page;

  // Currently logged in user uuid
  private userUuid: string;

  private deviceRegistrationId: string;

  private persistentStorage: PersistentStorage;
  private persistentData: PushPersistentData;

  constructor(
    private events: Events,
    private logger: Logger,
    private platform: Platform,
    private push: Push
  ) {
    if (!ENV.ffEnablePushNotifications) {
      this.logger.info('Push: feature is not enabled.');
      return;
    }

    // Set default state of persistent data. We will later read it from storage.
    this.persistentData = {
      isPermissionGranted: false,
      lastPrimingScreenShown: undefined
    };

    this.events.subscribe(SharedEventTypes.afterLogin, (e: AfterLoginEvent) => this.onLogin(e));
    this.events.subscribe(SharedEventTypes.beforeLogout, () => this.onBeforeLogout());
  }

  /**
   * Initialize push notification. Must be called at the start of the app.
   * @param navCtrl to be used for showing permission priming screen.
   * @param primingScreenPage the screen that will be shown before we ask
   *    for system push permissions on iOS (ignore on Android).
   */
  async init(navCtrl: NavController, primingScreenPage: Page, persistentStorage: PersistentStorage): Promise<void> {
    if (!ENV.ffEnablePushNotifications) {
      return;
    }

    this.logger.info('Push: initializing.');

    this.navCtrl = navCtrl;
    this.primingScreenPage = primingScreenPage;
    this.persistentStorage = persistentStorage;

    // Read our persistent data from storage
    const p: PushPersistentData = await persistentStorage.get('push_notification_params');
    if (p) {
      this.persistentData = p;
    }

    if (this.platform.is('android')) {
      //   // Ask permission on android immediately, since it is granted automatically
      //   this.askSystemPermission();
    }

    if (this.persistentData.isPermissionGranted) {
      // Permission is already granted, go ahead and finish initialization of push system,
      // it is safe to do now, it will not trigger permission asking system dialog anymore.
      this.getSystemPermissionAndRegister();
    }
  }

  setUser(userUuid: string): void {
    this.userUuid = userUuid;
  }

  /**
   * Show a permission priming screen if needed. The screen is needed
   * on iOS only and we only show it infrequently, so some executions
   * of this method may return PermissionScreenResult.notNeeded result.
   *
   * If the screen is shown and the user grants permission then also get system
   * push permission. If system permission is granted registers this device with
   * the backend to receive notifications.
   *
   * @param asRoot if true sets the permission screen as root otherwise
   *               pushes it to navigation stack (making "pop" possible).
   */
  showPermissionScreen(asRoot: boolean): Promise<PermissionScreenResult> {
    if (!ENV.ffEnablePushNotifications) {
      return Promise.resolve(PermissionScreenResult.notNeeded);
    }

    if (this.persistentData.lastPrimingScreenShown &&
      this.persistentData.lastPrimingScreenShown.valueOf() + minTimeBetweenPrimingScreenDisplaysMilliseconds > new Date().valueOf()) {
      // Not enough time passed since we have shown the screen last time. Skip this time.
      this.logger.info('Push: will not ask permission this time, too soon. Last asked at',
        this.persistentData.lastPrimingScreenShown);
      return Promise.resolve(PermissionScreenResult.notNeeded);
    }

    this.logger.info('Push: showing permission priming screen');

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
              const result = await this.getSystemPermissionAndRegister();
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

        // Remember that we displayed the screen
        this.persistentData.lastPrimingScreenShown = new Date();
        this.savePersistentData();
      });
    }
  }

  /**
   * Gets from system permission to receive push notifications (if does not already
   * have that permission). On iOS this triggers a system modal dialog, on Android
   * this permission is granted automatically without dialog.
   *
   * Once permission is received get device registration id and associate the
   * device with currently logged in user (if any). From this moment we will begin
   * to receive push notifications via this.onNotification() method.
   */
  private async getSystemPermissionAndRegister(): Promise<boolean> {
    if (!ENV.ffEnablePushNotifications) {
      return false;
    }

    this.logger.info('Push: getting system permission');

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

    this.persistentData.isPermissionGranted = true;
    await this.savePersistentData();

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

    // Log the errors
    pushObject.on('error').subscribe(error => this.logger.error('Push: error with Push plugin', error));

    return true;
  }

  private savePersistentData(): Promise<void> {
    return this.persistentStorage.set('push_notification_params', this.persistentData);
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

  private onLogin(e: AfterLoginEvent): void {
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
