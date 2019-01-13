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
export interface BaseAppointmentModel {
  uuid: string;
  status: AppointmentStatus;
  created_at: ISODateTime;
  datetime_start_at: ISODateTime;
  duration_minutes: number;
  services: ServiceFromAppointment[];
  // Everything about the price:
  total_client_price_before_tax: number;
  total_card_fee: number;
  grand_total: number;
  total_tax: number;
  tax_percentage: number;
  card_fee_percentage: number;
  has_card_fee_included: boolean;
  has_tax_included: boolean;
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
  appointment_uuid?: string; // empty if it’s a new appointment
  stylist_uuid?: string;     // used only in the Client App
  datetime_start_at: ISODateTime;
  services: CheckOutService[];
  has_tax_included: boolean;
  has_card_fee_included: boolean;
}

export interface AppointmentPreviewResponse {
  duration_minutes: number;
  grand_total: number;
  total_client_price_before_tax: number;
  total_tax: number;
  total_card_fee: number;
  tax_percentage: number;
  card_fee_percentage: number;
  services: ServiceFromAppointment[];
}

export interface AppointmentChangeRequest {
  status?: AppointmentStatus;
  has_tax_included?: boolean;
  has_card_fee_included?: boolean;
  services?: CheckOutService[];
  price_change_reason?: string;
}

export type AppointmentChangeResponse =
  | StylistAppointmentModel
  | ClientAppointmentModel;
