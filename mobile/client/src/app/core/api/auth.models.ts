import { StylistModel } from '~/core/api/stylists.models';

export interface GetCodeParams {
  phone: string;
}

export type GetCodeResponse = object;

export interface ConfirmCodeParams extends GetCodeParams {
  code: string;
}

export interface AuthTokenModel {
  token: string;
  created_at: number; // timestamp
}

export interface ConfirmCodeResponse extends AuthTokenModel {
  stylist_invitation?: StylistModel;
}
