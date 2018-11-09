import { Injectable } from '@angular/core';
import { NotificationEventResponse, Push, PushObject, PushOptions, RegistrationEventResponse } from '@ionic-native/push';
import { Page } from 'ionic-angular/navigation/nav-util';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { Events, Platform } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import {
  AfterLoginEvent,
  PushNotificationEventDetails,
  SharedEventTypes
} from '~/shared/events/shared-event-types';
import { isDevelopmentBuild } from '~/shared/get-build-info';
import { PlatforNames } from '~/shared/constants';
import { NotificationsApi, PushDeviceType, RegUnregDeviceRequest } from '~/shared/push/notifications.api';

import { ENV } from '~/environments/environment.default';
import { appDefinitions } from '~/environments/app-def';

/**
 * All the known codes we have inside the code prop in NotificationEventAdditionalData of the NotificationEventResponse.
 */
export enum PushNotificationCode { // (!) in alphabetical order
  appeared_in_search = 'appeared_in_search',
  appointment_reminder = 'appointment_reminder',
  appointment_reminder_early = 'appointment_reminder_early',
  cancelled_appointment = 'cancelled_appointment',
  checkout_reminder = 'checkout_reminder',
  client_saved_you = 'client_saved_you',
  client_viewed_you = 'client_viewed_you',
  hint_to_first_book = 'hint_to_first_book',
  hint_to_rebook = 'hint_to_rebook',
  hint_to_select_stylist = 'hint_to_select_stylist',
  invitation_accepted = 'invitation_accepted',
  low_price_hint = 'low_price_hint',
  new_appointment = 'new_appointment',
  new_stylists_available = 'new_stylists_available',
  no_show_warning = 'no_show_warning',
  prices_increasing = 'prices_increasing',
  profile_incomplete = 'profile_incomplete',
  registration_incomplete = 'registration_incomplete',
  stylist_ready = 'stylist_ready',
  today_appointments = 'today_appointments',
  tomorrow_appointments = 'tomorrow_appointments',
  visit_report = 'visit_report'
}

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
                        // case if permission is already granted or we are running on Android.

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
 * in the call to PushPersistent.init() method. get/set function
 * signatures are compatible with generic AppStorage class which makes
 * it trivial to satisfy the requirements of this interface by simply
 * declaring "pushNotificationParams: PushPersistentData" member in
 * your app's persistent storage.
 */
export interface PersistentStorage {
  set(key: 'pushNotificationParams', value: PushPersistentData): Promise<void>;
  get(key: 'pushNotificationParams'): PushPersistentData;
}

/**
 * Service that receives push notifications from backend.
 * Uses Ionic Push plugin: https://ionicframework.com/docs/native/push/
 *
 * Intended usage:
 * 1. When the app starts call PushNotification.init().
 *    On Android this will perform all neccesarry initialization, will get system
 *    permission for push notifications, will register the device with FCM and
 *    will be ready to associate the device once the user becomes known.
 *    On iOS this performs bare minimum of initialization because on iOS we
 *    have to use more complex approach with permission priming screen (see below).
 *
 * 2. At some point in the app when the user is already engaged call
 *    PushNotification.showPermissionScreen().
 *    On iOS this will show the priming screen to the user (if neccessary,
 *    see jsdoc of the function) and if the user agrees to move forward
 *    will request the system push notification. If the system permission
 *    is granted we will then proceed to register the device with APNS
 *    and will be ready to associate the device once the user becomes known.
 *    On Android this normally does nothing since the permissions are
 *    already granted by init() call.
 *
 * This class subscribes to Login/Logout events and tracks the current user uuid
 * and associates/deassociates the current user with this device.
 *
 * If the user becomes known in the app but Login event is not generated it is your
 * responsibility to call PushNotification.setUser manually. (this can happen if we
 * are restoring previously stored authenticated session without peforming actual
 * user-facing Login action).
 */
@Injectable()
export class PushNotification {
  private navCtrl: NavController;
  private primingScreenPage: Page;

  // Is device registration successfully done?
  private isRegistered = false;

  // Currently logged in user uuid
  private userUuid: string;

  private deviceRegistrationId: string;

  private persistentStorage: PersistentStorage;
  private persistentData: PushPersistentData;

  private deviceType: PushDeviceType;

  constructor(
    private events: Events,
    private logger: Logger,
    private api: NotificationsApi,
    private platform: Platform,
    private push: Push
  ) {
    if (!ENV.ffEnablePushNotifications) {
      this.logger.info('Push: feature is not enabled.');
      return;
    }

    this.deviceType = this.platform.is(PlatforNames.android) ? 'fcm' : 'apns';

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
   * @param primingScreenPage the screen that will be shown before we ask for system push permissions on iOS (ignored on Android).
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
    const p: PushPersistentData = await persistentStorage.get('pushNotificationParams');
    if (p) {
      this.persistentData = p;
    }

    if (this.platform.is(PlatforNames.android)) {
      // Ask permission on android immediately, since it is granted automatically
      this.getSystemPermissionAndRegister();
    } else if (this.persistentData.isPermissionGranted) {
      // Permission is already granted, go ahead and finish initialization of push system,
      // it is safe to do now, it will not trigger permission asking system dialog anymore.
      this.getSystemPermissionAndRegister();
    }
  }

  /**
   * Call this method if current user changes in a way that does not trigger Login/Logout events.
   */
  setUser(userUuid: string): void {
    this.userUuid = userUuid;

    if (this.userUuid) {
      this.associateUserWithDevice();
    } else {
      this.unAssociateUserWithDevice();
    }
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

    if (this.persistentData.isPermissionGranted) {
      // Permission is already granted, no need to show priming screen
      return this.getSystemPermissionAndRegister().then(granted =>
        granted ? PermissionScreenResult.permissionGranted : PermissionScreenResult.permissionNotGranted);
    }

    if (this.persistentData.lastPrimingScreenShown &&
      this.persistentData.lastPrimingScreenShown.valueOf() + minTimeBetweenPrimingScreenDisplaysMilliseconds > new Date().valueOf()) {
      // Not enough time passed since we have shown the screen last time. Skip this time.
      this.logger.info('Push: will not ask permission this time, too soon. Last asked at',
        this.persistentData.lastPrimingScreenShown);
      return Promise.resolve(PermissionScreenResult.notNeeded);
    }

    this.logger.info('Push: showing permission priming screen');

    if (this.platform.is(PlatforNames.android)) {
      // Permission screen is not needed on android
      return Promise.resolve(PermissionScreenResult.notNeeded);
    } else {
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
   * Device registration handler. Called after the device is registered with FCM/APNS.
   * Note: this should not be called directly, it is public only to be used in unit tests.
   */
  onDeviceRegistration(registration: RegistrationEventResponse): void {
    this.logger.info('Push: device registered:', registration.registrationId);
    this.deviceRegistrationId = registration.registrationId;
    if (this.userUuid) {
      // We have both device id and user id, associate them now.
      this.associateUserWithDevice();
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
   *
   * After registration is successfull calling this function again is harmless,
   * we just return true.
   */
  private async getSystemPermissionAndRegister(): Promise<boolean> {
    if (!ENV.ffEnablePushNotifications) {
      return false;
    }

    if (this.isRegistered) {
      return true;
    }

    this.logger.info('Push: getting system permission');

    // Try to get system push notification permission
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

    // Initialize Push plugin
    const options: PushOptions = {
      android: {
        senderID: ENV.FCM_PUSH_SENDER_ID
      },
      ios: {
        alert: true,
        badge: true,
        sound: true
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

    return this.isRegistered = true;
  }

  private savePersistentData(): Promise<void> {
    return this.persistentStorage.set('pushNotificationParams', this.persistentData);
  }

  /**
   * Push notification handler. Called when we have a new message pushed to us.
   */
  private onNotification(notification: NotificationEventResponse): void {
    let notificationStr;
    try {
      notificationStr = JSON.stringify(notification);
    } catch {
      // ignore errors
    }
    this.logger.info(`Push notification received ${notificationStr}`);

    const { additionalData, message } = notification;
    const { code, coldstart, foreground, uuid } = additionalData;
    this.events.publish(
      SharedEventTypes.pushNotification,
      new PushNotificationEventDetails(foreground, coldstart, uuid, code, message)
    );
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

  private prepareRequest(): RegUnregDeviceRequest {
    return {
      device_registration_id: this.deviceRegistrationId,
      device_type: this.deviceType,
      is_development_build: isDevelopmentBuild(),
      user_role: appDefinitions.userRole
    };
  }

  private async associateUserWithDevice(): Promise<void> {
    if (!this.deviceRegistrationId) {
      // Device is not yet known, nothing can be done.
      return;
    }

    this.logger.info(`Push: registering device ${this.deviceRegistrationId} to user ${this.userUuid}`);

    // Tell backend to associate device with the user
    await this.api.registerDevice(this.prepareRequest()).toPromise();
  }

  private async unAssociateUserWithDevice(): Promise<void> {
    if (!this.deviceRegistrationId) {
      // Device is not yet known, nothing can be done.
      return;
    }

    this.logger.info(`Push: uregistering device ${this.deviceRegistrationId} from user ${this.userUuid}`);

    // Tell backend to unassociate device from the user
    await this.api.unregisterDevice(this.prepareRequest()).toPromise();
  }
}
