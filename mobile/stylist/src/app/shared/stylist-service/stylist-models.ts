// Stylist profile

export interface StylistProfile {
  first_name: string;
  last_name: string;
  phone: string;
  salon_name: string;
  salon_address: string;
  profile_photo_id?: string;
  profile_photo_url?: string;
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
  uuid?: string;
  name: string;
  description: string;
  image_url: string;
  services: ServiceName[];
}

export interface ServiceName {
  name: string;
}

export interface ServiceTemplateSet {
  id?: number;
  name: string;
  description: string;
  categories: ServiceCategory[];
}

export interface ServiceCategory {
  uuid: string;
  name: string;
  services: ServiceTemplateItem[];
}

export interface ServiceTemplateItem {
  categoryUuid?: string;

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
export interface ServiceItem extends ServiceTemplateItem {
  is_enabled: boolean;
  photo_samples: ServicesPhotoSample[];
}

export interface ServicesPhotoSample {
  url: string;
}
