/**
 * Global application events that are dispatched and handled from decoupled
 * part of the code.
 */
export enum StylistEventTypes {
  menuUpdateProfileSubscription = 'menuUpdateProfileSubscription',
  focusAppointment = 'focusAppointment'
}

/**
 * Params’ interface of StylistEventTypes.focusAppointment event.
 */
export interface FocusAppointmentEventParams {
  appointment_datetime_start_at: string; // start of appointment in iso format
  appointment_uuid?: string; // uuid of appointment
}
