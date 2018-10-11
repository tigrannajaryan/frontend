import { DayOffer } from '~/shared/api/price.models';

export interface ClientModel {
  first_name?: string;
  last_name?: string;
  photo?: string;
}

export interface MyClientModel extends ClientModel {
  uuid: string;
  phone: string;
  city?: string;
  state?: string;
}

export interface GetNearbyClientsResponse {
  clients: ClientModel[];
}

export interface GetMyClientsResponse {
  clients: MyClientModel[];
}

export interface GetPricingResponse {
  prices: DayOffer[];
  client_uuid?: string;
  service_uuids?: string[];
}
