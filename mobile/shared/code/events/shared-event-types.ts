import { PushNotificationCode } from '~/shared/push/push-notification';

/**
 * Global application events that are dispatched and handled from decoupled
 * part of the code. Shared between Client and Stylist App.
 */
export enum SharedEventTypes {
  /**
   * Event fired when StylistServiceProvider.getProfile() gets resolved.
   * This event is needed because the Google Maps api loads the api key dynamically.
   * When this event is fired, the subscriber in GoogleMapsConfig updates the api key
   * and the google library automatically updates it's key.
   */
  update_gmap_key = 'update_gmap_key',

  afterLogin = 'afterLogin',

  beforeLogout = 'beforeLogout',
  afterLogout = 'afterLogout',

  /**
   * This event is published when notification happens:
   * |  this.events.publish(PushNotificationEvent, new PushNotificationEventDetails(…));
   *
   * Observe it to handle notifications:
   * |  this.events.subscribe(PushNotificationEvent, (details: PushNotificationEventDetails) => {…});
   */
  pushNotification = 'pushNotification',

  continueAfterPushPriming = 'continueAfterPushPriming'
}

export class PushNotificationEventDetails {
  constructor(
    // Indicates the notification received while the app is in the foreground or background:
    public foreground: boolean,
    // Coldstart is true when the application is started by clicking on the push notification:
    public coldstart: boolean,
    // Notification uuid from the backend (used in notification acknowledged API call):
    public uuid: string,
    // Unique notification code we use in the backend:
    public code: PushNotificationCode,
    // A message from NotificationEventResponse:
    public message: string
  ) {
  }
}

export interface AfterLoginEvent {
  userUuid: string;
}
