import { StylistModel } from '~/shared/api/stylists.models';

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
  created_at: number; // timestamp
}

export interface ConfirmCodeResponse extends AuthTokenModel {
  stylist_invitation?: StylistModel;
}
