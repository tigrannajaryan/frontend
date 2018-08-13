export interface GetStylistServicesParams {
  stylist_uuid: string;
}

export interface ServiceModel {
  uuid: string;
  name: string;
  regular_price: number;
}

export interface ServiceCategoryModel {
  uuid: string;
  name: string;
  services: ServiceModel[];
  category_photo_url?: string;
}

export interface GetStylistServicesResponse {
  stylist_uuid: string;
  categories: ServiceCategoryModel[];
}

export interface GetPricelistParams {
  service_uuid: string;
}

export enum DiscountType {
  FirstVisit = 'first-visit',
  FrequentVisit = 'frequent-visit',
  Weekday = 'weekday'
}

export enum ISOWeekday {
  Mon = 1,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
  Sun
}

export type ISODate = string; // ISO 8601: YYYY-MM-DD

export interface DayOffer {
  date: ISODate;
  price: number;
  is_fully_booked: boolean;
  is_working_day: boolean;
  discount_type?: DiscountType;
}

export interface GetPricelistResponse {
  stylist_uuid: string;
  service_uuid: string;
  prices: DayOffer[];
}
