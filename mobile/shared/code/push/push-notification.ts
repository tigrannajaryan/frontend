import { Injectable } from '@angular/core';
import { NotificationEventResponse, Push, PushObject, PushOptions, RegistrationEventResponse } from '@ionic-native/push';
import { Events, Platform } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import {
  AfterLoginEvent,
  PushNotificationEventDetails,
  SharedEventTypes
} from '~/shared/events/shared-event-types';
import { isDevelopmentBuild } from '~/shared/get-build-info';
import { PlatformNames } from '~/shared/constants';
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
  invite_your_stylist = 'invite_your_stylist',
  low_price_hint = 'low_price_hint',
  new_appointment = 'new_appointment',
  new_stylists_available = 'new_stylists_available',
  no_show_warning = 'no_show_warning',
  prices_increasing = 'prices_increasing',
  profile_incomplete = 'profile_incomplete',
  registration_incomplete = 'registration_incomplete',
  remind_add_photo = 'remind_add_photo',
  remind_define_hours = 'remind_define_hours',
  remind_define_services = 'remind_define_services',
  stylist_ready = 'stylist_ready',
  today_appointments = 'today_appointments',
  tomorrow_appointments = 'tomorrow_appointments',
  visit_report = 'visit_report'
}

// tslint:disable-next-line:no-empty-interface
export interface EmptyAdditionalData { // for simple notifications
}

export interface NewAppointmentAdditionalData { // new_appointment
  appointment_datetime_start_at: string; // start of appointment in iso format
  appointment_uuid: string; // uuid of appointment
}

export interface TomorrowAppointmentsAdditionalData { // tomorrow_appointments
  appointment_datetime_start_at: string; // start of appointment in iso format
}

/**
 * All known additional data key-values provided in additionalData prop of a push-notification.
 */
// NOTE: list any additional data you would like to use
export type PushNotificationAdditionalData = // (!) in alphabetical order
  | EmptyAdditionalData
  | NewAppointmentAdditionalData
  | TomorrowAppointmentsAdditionalData;

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
  isPermissionDenied: boolean;
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

  // Is device registration successfully done?
  private isRegistered = false;

  // Currently logged in user uuid
  private userUuid: string;

  private deviceRegistrationId: string;

  private persistentStorage: PersistentStorage;
  private persistentData: PushPersistentData;

  private deviceType: PushDeviceType;

  private appReady: Promise<boolean>;

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

    this.appReady = new Promise(resolve => {
      this.events.subscribe(SharedEventTypes.appLoaded, resolve);
      this.platform.resume.subscribe(resolve);
    });

    this.deviceType = this.platform.is(PlatformNames.android) ? 'fcm' : 'apns';

    // Set default state of persistent data. We will later read it from storage.
    this.persistentData = {
      isPermissionGranted: false,
      isPermissionDenied: false,
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
  async init(persistentStorage: PersistentStorage): Promise<void> {
    if (!ENV.ffEnablePushNotifications) {
      return;
    }

    this.logger.info('Push: initializing.');

    this.persistentStorage = persistentStorage;

    // Read our persistent data from storage
    const p: PushPersistentData = await persistentStorage.get('pushNotificationParams');
    if (p) {
      this.persistentData = p;
    }

    if (this.platform.is(PlatformNames.android)) {
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
   * Decide if we need to show a permission priming screen. The screen is needed
   * on iOS only and we only show it infrequently, so some executions
   * of this method may return false result even though later we decide to show it.
   */
  async needToShowPermissionScreen(): Promise<boolean> {
    if (!ENV.ffEnablePushNotifications) {
      return false;
    }

    if (this.persistentData.isPermissionGranted) {
      this.logger.info('Push: permission is granted in the past');
      // Permission is already granted, no need to show priming screen
      return false;
    }

    if (this.persistentData.isPermissionDenied) {
      // We tried to obtain persmission in the past and were rejected. Showing this
      // screen again is useless, we cannot obtain permission anymore (the rejections
      // are permanent under iOS).
      this.logger.info('Push: permission is denied in the past');
      return false;
    }

    if (this.persistentData.lastPrimingScreenShown &&
      this.persistentData.lastPrimingScreenShown.valueOf() + minTimeBetweenPrimingScreenDisplaysMilliseconds > new Date().valueOf()) {
      // Not enough time passed since we have shown the screen last time. Skip this time.
      this.logger.info('Push: will not ask permission this time, too soon. Last asked at',
        this.persistentData.lastPrimingScreenShown);
      return false;
    }

    if (this.platform.is(PlatformNames.android)) {
      // Permission screen is not needed on android
      this.logger.info('Push: running on Android. Permission is granted automatically.');
      return false;
    } else {
      // On iOS we use priming screen first to reduce rejection rate
      this.logger.info('Push: need to show permission priming screen');
      return true;
    }
  }

  refreshLastPrimingScreenShowTime(): void {
    // Remember that we displayed the screen
    this.persistentData.lastPrimingScreenShown = new Date();
    this.savePersistentData();
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
  async getSystemPermissionAndRegister(): Promise<boolean> {
    if (!ENV.ffEnablePushNotifications) {
      return false;
    }

    if (this.isRegistered) {
      return true;
    }

    this.logger.info('Push: getting system permission');

    // Try to get system push notification permission
    let permissionDenied = false;
    try {
      if (!await this.push.hasPermission()) {
        this.logger.warn('Push: we do not have permission to send push notifications');
        permissionDenied = true;
      }
    } catch (e) {
      this.logger.error('Push: cannot get push notification permission:', e);
      permissionDenied = true;
    }

    if (permissionDenied) {
      this.persistentData.isPermissionDenied = true;
      await this.savePersistentData();
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
    pushObject.on('notification').subscribe((notification: NotificationEventResponse) => this.onNotification(notification, pushObject));

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
  private async onNotification(notification: NotificationEventResponse, pushObject: PushObject): Promise<void> {
    let notificationStr;
    try {
      notificationStr = JSON.stringify(notification);
    } catch {
      // ignore errors
    }
    this.logger.info(`Push notification received ${notificationStr}`);

    const { additionalData, message } = notification;
    const { code, coldstart, foreground, uuid, ...data } = additionalData;

    // NOTE: the next line ensures notification is handled only after all initial work is done
    await this.appReady;

    this.events.publish(
      SharedEventTypes.pushNotification,
      new PushNotificationEventDetails(foreground, coldstart, uuid, code, message, data)
    );

    try {
      // When you receive a background push on iOS you will be given 30 seconds of time in which to complete a task.
      // If you spend longer than 30 seconds on the task the OS may decide that your app is misbehaving and kill it.
      // In order to signal iOS that your on('notification') handler is done you will need to call the push.finish() method.
      await pushObject.finish();
    } catch {
      // ignore errors
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
