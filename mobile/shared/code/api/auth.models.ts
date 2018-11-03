import { StylistModel } from '~/shared/api/stylists.models';
import { StylistProfile, StylistProfileStatus } from '~/shared/api/stylist-app.models';

export type UserRole = 'stylist' | 'client';

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

// tslint:disable-next-line:no-empty-interface
export interface ClientProfileStatus {
  // We currently do not send any client profile status in auth response.
  // This will be added in the future.
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
