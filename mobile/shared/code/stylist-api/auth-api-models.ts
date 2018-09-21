import { StylistProfile } from './stylist-models';

export enum UserRole { stylist = 'stylist', client = 'client' }

export interface AuthCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface ProfileStatus {
  has_personal_data: boolean;
  has_picture_set: boolean;
  has_services_set: boolean;
  has_business_hours_set: boolean;
  has_weekday_discounts_set: boolean;
  has_other_discounts_set: boolean;
  has_invited_clients: boolean;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  profile?: StylistProfile;
  profile_status?: ProfileStatus;
}
