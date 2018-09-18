export enum SharedEventTypes {
  /**
   * Event fired when StylistServiceProvider.getProfile() gets resolved.
   * This event is needed because the Google Maps api loads the api key dynamically.
   * When this event is fired, the subscriber in GoogleMapsConfig updates the api key
   * and the google library automatically updates it's key.
   */
  UPDATE_GMAP_KEY = 'UPDATE_GMAP_KEY'

}
