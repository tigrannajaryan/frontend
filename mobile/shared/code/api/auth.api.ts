import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiRequestOptions } from '~/shared/api-errors';
import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base-service';
import {
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/shared/api/auth.models';

@Injectable()
export class AuthService extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getCode(data: GetCodeParams, options: ApiRequestOptions): Observable<ApiResponse<GetCodeResponse>> {
    return this.post<GetCodeResponse>('auth/get-code', data, undefined, options);
  }

  confirmCode(data: ConfirmCodeParams, options: ApiRequestOptions): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.post<ConfirmCodeResponse>('auth/code/confirm', data, undefined, options);
  }
}
