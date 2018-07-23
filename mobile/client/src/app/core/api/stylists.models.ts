export interface StylistModel {
  uuid: string;
  first_name: string;
  last_name: string;
  salon_name: string;
  salon_address: string;
  phone: string;
  instagram_profile_name: string;
  profile_photo_url?: string;
}

export interface SearchStylistsResponse {
  stylists: StylistModel[];
}
