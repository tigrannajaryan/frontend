import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { UserRole } from '~/shared/api/auth.models';

import config from '~/auth/config.json';
import { UserContext } from '~/shared/user-context';

export enum IntegrationTypes {
  google_calendar = 'google_calendar'
}

export interface AddIntegrationRequest {
  server_auth_code: string;
  integration_type: IntegrationTypes;
}

@Injectable()
export class IntegrationsApi extends BaseService {

  static role: UserRole = (config && config.role) || 'client';

  constructor(
    protected userContext: UserContext,
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  addIntegration(request: AddIntegrationRequest): Observable<ApiResponse<void>> {
    return this.post<void>('common/integrations', { ...request, user_role: IntegrationsApi.role });
  }
}
