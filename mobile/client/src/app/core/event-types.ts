/**
 * Global application events that are dispatched and handled from decoupled
 * part of the code.
 */
export enum EventTypes {
  logout = 'logout',
  selectMainTab = 'selectMainTab',
  selectStylistTab = 'selectStylistTab',
  startBooking = 'startBooking',
  startRebooking = 'startRebooking'
}
