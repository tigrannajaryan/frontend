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

  login = 'login',

  beforeLogout = 'beforeLogout',
  afterLogout = 'afterLogout'
}

export interface LoginEvent {
  userUuid: string;
}
