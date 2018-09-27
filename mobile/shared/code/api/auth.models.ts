import { StylistModel } from '~/shared/api/stylists.models';

import { StylistProfileStatus } from '~/shared/stylist-api/auth-api-models';
import { StylistProfile } from '~/shared/stylist-api/stylist-models';

export type UserRole = 'stylist' | 'client';

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
}

export interface ConfirmCodeResponse extends AuthTokenModel {
  stylist_invitation?: StylistModel;
  profile_status?: StylistProfileStatus;
  profile?: StylistProfile;
}
