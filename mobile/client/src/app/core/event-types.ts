/**
 * Global application events that are dispatched and handled from decoupled
 * part of the code.
 */
export enum EventTypes {
  bookingComplete = 'bookingComplete',
  logout = 'logout',
  startBooking = 'startBooking',
  startRebooking = 'startRebooking'
}
