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
  GetCodeResponse,
  UserRole
} from '~/shared/api/auth.models';

import config from '~/auth/config.json';

@Injectable()
export class AuthService extends BaseService {

  static role: UserRole = (config && config.role) || 'client';

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getCode(data: GetCodeParams, options: ApiRequestOptions): Observable<ApiResponse<GetCodeResponse>> {
    return this.post<GetCodeResponse>('auth/get-code', { ...data, role: AuthService.role }, undefined, options);
  }

  confirmCode(data: ConfirmCodeParams, options: ApiRequestOptions): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.post<ConfirmCodeResponse>('auth/code/confirm', { ...data, role: AuthService.role }, undefined, options);
  }
}
