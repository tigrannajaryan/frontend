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
  website_url: string;
  followers_count: number;
  profile_photo_id?: string;
  profile_photo_url?: string;
  google_api_key?: string;
  google_calendar_integrated?: boolean;

  email?: string;
}

export interface StylistProfileCompleteness {
  isProfileComplete: boolean;
  completenessPercent: number;
}

export interface StylistProfileStatus {
  has_personal_data: boolean;
  has_picture_set: boolean;
  has_services_set: boolean;
  has_business_hours_set: boolean;
  has_weekday_discounts_set: boolean;
  has_other_discounts_set: boolean;
  has_invited_clients: boolean;
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

export interface ServicesPhotoSample {
  url: string;
}

export interface SetStylistServicesParams {
  services: ServiceItem[];
  service_time_gap_minutes: number;
}

export type StylistServicesListResponse = StylistServicesList;
