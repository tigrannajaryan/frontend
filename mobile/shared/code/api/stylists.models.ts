import { LatLng } from '~/shared/utils/geolocation.service';
import { UserRole } from '~/shared/api/auth.models';
import { ISODateTime } from '~/shared/api/base.models';

/**
 * Stylist models used in Client App API.
 */

export interface StylistUuidModel {
  uuid: string;
}

export interface StylistModel extends StylistUuidModel {
  first_name: string;
  last_name: string;
  salon_name: string;
  salon_address: string;
  specialities: string[];
  phone: string;
  email: string;
  followers_count: number;
  is_profile_bookable: boolean;
  rating_percentage: number;
  instagram_url?: string;
  website_url?: string;
  profile_photo_url?: string;

  is_profile_preferred?: boolean;
  preference_uuid?: string;
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

export interface StylistProfileRequestParams {
  stylistUuid: string;
  role: UserRole;
}
export interface StylistProfileResponse {
  uuid: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string;
  is_preferred: boolean; // Always false when `?role=stylist`
  preference_uuid: string; // Always null when `?role=stylist` or no preference exists
  salon_name: string;
  salon_address: string;
  followers_count: number;
  instagram_url: string;
  instagram_integrated: boolean;
  website_url: string;
  email: string;
  phone: string;
  is_profile_bookable: boolean;
  working_hours: {
    weekdays: WorkingHours[]
  };
  location: {
    lat: string;
    lng: string;
  };
  rating_percentage: number;
}

export interface WorkingHours {
  weekday_iso: number;
  label: string;
  work_start_at: string;
  work_end_at: string;
  is_available: boolean;
}

export interface InstagramImage {
  width: number;
  height: number;
  url: string;
}

export interface InstagramMedia {
  id: string;
  content_type: 'image' | 'video';
  likes_count: number;
  images: {
    low_resolution: InstagramImage;
    standard_resolution: InstagramImage;
    thumbnail: InstagramImage;
  };
}

export interface StylistInstagramImagesResponse {
  instagram_media: InstagramMedia[];
}

export interface RatingResponse {
  rating: Rating[];
}

export interface Rating {
  client_name: string;
  client_photo_url: string;
  rating: number;
  appointment_datetime: ISODateTime;
  comment: string;
}
