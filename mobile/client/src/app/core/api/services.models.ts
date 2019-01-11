import { DayOffer, ServiceModel } from '~/shared/api/price.models';
import { PricingHint } from '~/shared/components/services-header-list/services-header-list';

export interface GetStylistServicesParams {
  stylist_uuid: string;
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

export interface GetPricelistResponse {
  stylist_uuid: string;
  prices: DayOffer[];
  pricing_hints: PricingHint[];
  service_uuids?: string[];
}
