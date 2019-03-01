// Stylist profile

export interface StylistProfileName {
  first_name: string;
  last_name: string;
}

export interface StylistProfile extends StylistProfileName {
  uuid?: string;
  phone: string;
  public_phone: string;
  salon_name: string;
  salon_address: string;
  instagram_url: string;
  instagram_integrated: boolean;
  website_url: string;
  followers_count: number;
  profile_status: StylistProfileStatus;

  profile_photo_id?: string;
  profile_photo_url?: string;
  google_api_key?: string;
  google_calendar_integrated?: boolean;
  email?: string;
  salon_city?: string;
  salon_state?: string;
  salon_zipcode?: string;
}

export interface StylistProfileCompleteness {
  isProfileComplete: boolean;
  completenessPercent: number;
  profileIncomplete: ProfileIncompleteObject[];
}

// we use this interface in profile incomplete page
// for the list of incomplete items
export interface ProfileIncompleteObject {
  name: string;
  type: ProfileIncompleteField;
  isComplete: boolean;
  onClick(): void;
}

export enum ProfileIncompleteField {
  first_name,
  last_name,
  salon_name,
  salon_address,
  profile_photo_url,
  email,
  website_url,
  instagram_integrated,
  has_deal_of_week,
  has_weekday_discounts_set,
  has_invited_clients,
  has_services_set,
  has_business_hours_set,
  can_checkout_with_made,
  google_calendar_integrated
}

export interface StylistProfileStatus {
  has_personal_data: boolean;
  has_picture_set: boolean;
  has_services_set: boolean;
  has_business_hours_set: boolean;
  has_weekday_discounts_set: boolean;
  has_other_discounts_set: boolean;
  has_invited_clients: boolean;
  must_select_deal_of_week: boolean;
  can_checkout_with_made: boolean;
  google_calendar_integrated: boolean;
}

// Weekday discounts

export interface WeekdayDiscount {
  label: string;
  weekday_iso: number;
  discount_percent: number;
}

export interface WeekdayDiscounts {
  weekdays: WeekdayDiscount[];
}

// Other discounts

export interface SimpleDiscounts {
  first_visit_discount_percent: number;
  repeat_within_1_week_discount_percent: number;
  repeat_within_2_week_discount_percent: number;
}

// Service templates

export interface ServiceName {
  name: string;
}

export interface ServiceTemplateSetBase {
  uuid: string;
  services_count: string;
}

export interface ServiceUuid {
  uuid?: string;
}

export interface ServiceTemplateSet extends ServiceTemplateSetBase {
  categories: ServiceCategory[];
}

export interface StylistServicesList {
  categories: ServiceCategory[];
  service_time_gap_minutes?: number;
}

export interface ServiceCategory {
  uuid: string;
  name: string;
  services: Array<ServiceTemplateItem | ServiceItem>;
  category_code?: string;
}

export interface ServiceTemplateItem {
  isChecked?: boolean;
  category_name?: string;
  category_uuid?: string;
  service_uuid?: string;

  uuid?: string;
  name: string;
  description?: string;
  base_price: number;
}

// Services
export interface ServiceItem extends ServiceTemplateItem {
  service_uuid?: string;
  is_enabled?: boolean;
  photo_samples?: ServicesPhotoSample[];
}

export interface CheckOutService {
  service_uuid: string;
  client_price?: number;
}

// NOTE: ServiceFromAppointment not extends CheckOutService (2 diff models), CheckOutService used in requests.
export interface ServiceFromAppointment {
  service_uuid: string;
  service_name: string;
  client_price: number;
  regular_price: number;
  is_original: boolean;

  // Next boolean is used on services edit screen
  // and is not sent/received to/from the backend.
  isChecked?: boolean;
}

export interface ServicesPhotoSample {
  url: string;
}

export interface SetStylistServicesParams {
  services: ServiceItem[];
  service_time_gap_minutes: number;
}

export type StylistServicesListResponse = StylistServicesList;

export interface StylistSettings {
  tax_percentage: number;
  card_fee_percentage: number;
  stripe_connect_client_id?: string;
  google_calendar_integrated?: boolean;
  can_checkout_with_made?: boolean;
}

export enum StylistSettingsKeys {
  tax_percentage = 'tax_percentage',
  card_fee_percentage = 'card_fee_percentage',
  google_calendar_integrated = 'google_calendar_integrated'
}
