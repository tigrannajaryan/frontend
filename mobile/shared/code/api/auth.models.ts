import { StylistModel } from '~/shared/api/stylists.models';
import { StylistProfile, StylistProfileStatus } from '~/shared/api/stylist-app.models';

export enum UserRole {
  stylist = 'stylist',
  client = 'client'
}

export interface EmailAuthCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface GetCodeParams {
  phone: string;
  role: UserRole;
}

// tslint:disable-next-line:no-empty-interface
export interface GetCodeResponse {
}

export interface ConfirmCodeParams extends GetCodeParams {
  phone: string;
  code: string;
  role: UserRole;
}

export interface AuthTokenModel {
  token: string;
  created_at?: number; // timestamp
  expires_in?: number;
}

export interface ClientProfileStatus {
  has_name?: boolean;
  has_zipcode?: boolean;
  has_email?: boolean;
  has_picture_set?: boolean;
  has_preferred_stylist_set?: boolean;
  has_booked_appointment?: boolean;
  has_past_visit?: boolean;
}

export type UserProfileStatus = StylistProfileStatus | ClientProfileStatus;

export interface AuthResponse {
  token: string;
  user_uuid: string;
  created_at?: number; // timestamp
  profile_status?: UserProfileStatus;
}

export interface ConfirmCodeResponse extends AuthResponse {
  stylist_invitation?: StylistModel;
  profile?: StylistProfile;
}
