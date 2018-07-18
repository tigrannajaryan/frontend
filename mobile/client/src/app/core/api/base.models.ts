import { HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';

import { ApiError } from '~/core/api/errors.models';

export interface ApiRequest {
  data?: any;
  headers?: HttpHeaders;
  queryParams?: HttpParams;
}

export interface ApiResponse<ReponseType> {
  response: ReponseType;
  errors?: ApiError[];
}
