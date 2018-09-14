export interface StylistUuidModel {
  uuid: string;
}

export interface StylistModel extends StylistUuidModel {
  first_name: string;
  last_name: string;
  salon_name: string;
  salon_address: string;
  phone: string;
  instagram_profile_name: string;
  profile_photo_url?: string;
}

export interface PreferredStylistModel extends StylistModel {
  preference_uuid: string;
}

export interface StylistsListResponse {
  stylists: StylistModel[];
}

export interface PreferredStylistsListResponse {
  stylists: PreferredStylistModel[];
}

export interface SetPreferredStylistResponse {
  preference_uuid: string;
}
