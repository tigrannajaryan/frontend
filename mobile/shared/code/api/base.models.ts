import { HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';

import { ApiError } from '~/shared/api-errors';

export interface ApiRequest {
  data?: any;
  headers?: HttpHeaders;
  queryParams?: HttpParams;
}

export interface ApiResponse<ReponseType> {
  response: ReponseType;
  error?: ApiError;
}

export type ISODate = string; // ISO 8601: YYYY-MM-DD
export type ISODateTime = string; // ISO 8601: YYYY-MM-DDTHH:mm:ss

export const isoDateFormat = 'YYYY-MM-DD';
