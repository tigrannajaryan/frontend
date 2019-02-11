import { ISODateTime } from '~/shared/api/base.models';
import { CheckOutService, ServiceFromAppointment } from '~/shared/api/stylist-app.models';

/**
 * All the statuses an appointment can be in.
 */
export enum AppointmentStatus {
  new = 'new',
  cancelled_by_client = 'cancelled_by_client',
  cancelled_by_stylist = 'cancelled_by_stylist',
  no_show = 'no_show',
  checked_out = 'checked_out'
}

/**
 * Common fields for stylist’s and client’s appointment model.
 */
export interface BaseAppointmentPreviewModel {
  datetime_start_at: ISODateTime;
  duration_minutes: number;
  services: ServiceFromAppointment[];
  // Everything about the price:
  card_fee_percentage: number;
  grand_total: number;
  has_card_fee_included: boolean;
  has_tax_included: boolean;
  tax_percentage: number;
  total_card_fee: number;
  total_client_price_before_tax: number;
  total_discount_amount: number;
  total_discount_percentage: number;
  total_tax: number;
}

/**
 * Almost all fields from the preview plus additional fields from created appointment.
 */
export interface BaseAppointmentModel extends BaseAppointmentPreviewModel {
  uuid: string;
  status: AppointmentStatus;
  created_at: ISODateTime;
}

/**
 * The appointment model used in the Stylists’ App by stylists contains
 * additional fields relative to a client.
 */
export interface StylistAppointmentModel extends BaseAppointmentModel {
  client_uuid: string;
  client_first_name: string;
  client_last_name: string;
  client_profile_photo_url: string;
  client_phone: string;
}

/**
 * The appointment model used in the Clients’ App by clients contains
 * additional fields relative to a stylist and client’s photo url.
 */
export interface ClientAppointmentModel extends BaseAppointmentModel {
  stylist_uuid: string;
  stylist_first_name: string;
  stylist_last_name: string;
  stylist_photo_url: string;
  salon_name: string;
  profile_photo_url: string; // client’s photo
  rating: number;
  comment: string;
}

// Next you find shared (between 2 apps) requests and responses.
//
// Preview an appointment is used to show prices of an appointment’s services
// before creating or making a final changes in the appointment (see next).
//
// Change of the appointment is used to modify an appointment.
// Currently 2 types of modifications are widely used:
// - modify status of the appointment, e.g. ”new” –> ”checked_out”,
// - modify services’ prices by passing modified services.

export interface AppointmentPreviewRequest {
  datetime_start_at: ISODateTime;
  services: CheckOutService[];
  has_tax_included: boolean;
  has_card_fee_included: boolean;

  appointment_uuid?: string; // empty if it’s a new appointment
  stylist_uuid?: string;     // used only in the Client App
}

/**
 * In fact, the AppointmentPreviewResponse also includes fields
 * from StylistAppointmentModel or ClientAppointmentModel depending
 * on in which app this model is used. But in the code they are not
 * widely used, and for unification we extend BaseAppointmentModel.
 */
export type AppointmentPreviewResponse = BaseAppointmentPreviewModel;

/**
 * Usually the 3 change-cases are used:
 * - new status is supplied
 * - or services with updated prices and taxes are passed.
 * - raging and/or comment
 */
export interface AppointmentChangeRequest {
  status?: AppointmentStatus;
  has_tax_included?: boolean;
  has_card_fee_included?: boolean;
  services?: CheckOutService[];
  price_change_reason?: string;
  rating?: number; // (0|1) thumbsUp/Down
  comment?: string;
  // Next fields are needed to add payment method used in an appointment.
  // E.g. a client added his/her card and we should tell the backend
  // to charge money from the card on checkout.
  // If there is no payment method selected (e.g. when a client wants
  // to pay in the salon) null or undefined have to be provided.
  // NOTE: it’s used only in POST/PATCH and currently not returned back.
  // If you want to know payment methods of a client use PaymentsApi.
  payment_method_uuid?: string;
  pay_via_made?: boolean;
}

export type AppointmentChangeResponse =
  | StylistAppointmentModel
  | ClientAppointmentModel;
