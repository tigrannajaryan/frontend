// Stylist profile

export interface StylistProfile {
  first_name: string;
  last_name: string;
  phone: string;
  salon_name: string;
  salon_address: string;
  profile_photo_id: string;
}

// Stylist availability days and hours

export interface StylistAvailabilityDay {
  label: string;
  weekday_iso: number;
  available: boolean;
  day_start_at: string;
  day_end_at: string;
}

export interface StylistAvailability {
  weekdays: StylistAvailabilityDay[];
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

export interface ServicesTemplate {
  uuid?: number;
  name: string;
  description: string;
  image_url: string;
  services: ServiceTemplateServices[];
}

export interface ServiceTemplateServices {
  name: string;
}

export interface ServiceTemplateSet {
  id?: number;
  name: string;
  description: string;
  categories: ServiceTemplateSetCategories[];
}

export interface ServiceTemplateSetCategories {
  uuid: string;
  name: string;
  services: ServiceTemplateSetServices[];
}

export interface ServiceTemplateSetServices {
  categoryUuid?: number;

  id?: number;
  name: string;
  description: string;
  base_price: number;
  duration_minutes: number;
}

export interface ServiceTemplateSets {
  sets: ServiceTemplateSet[];
}

// Services
export interface Services extends ServiceTemplateSetServices {
  is_enabled: boolean;
  photo_samples: ServicesPhotoSamples[];
}

export interface ServicesPhotoSamples {
  url: string;
}
