import { DayOffer } from '~/shared/api/price.models';

export interface GetStylistServicesParams {
  stylist_uuid: string;
}

export interface ServiceModel {
  uuid: string;
  name: string;
  base_price: number;
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
  service_uuid: string;
  prices: DayOffer[];
}
