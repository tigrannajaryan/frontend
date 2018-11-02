import { LatLng } from '~/shared/utils/geolocation.service';

export interface StylistUuidModel {
  uuid: string;
}

export interface StylistModel extends StylistUuidModel {
  first_name: string;
  last_name: string;
  salon_name: string;
  salon_address: string;
  phone: string;
  followers_count: number;
  is_profile_bookable: boolean;
  instagram_url?: string;
  website_url?: string;
  profile_photo_url?: string;
}

export interface PreferredStylistModel extends StylistModel {
  preference_uuid: string;
}

export interface StylistsSearchParams {
  search_like: string;
  search_location?: string;
  geolocation?: LatLng;
}

export interface StylistsListResponse {
  stylists: StylistModel[];
  more_results_available?: boolean;
}

export interface PreferredStylistsListResponse {
  stylists: PreferredStylistModel[];
}

export interface AddPreferredStylistResponse {
  preference_uuid: string;
}
