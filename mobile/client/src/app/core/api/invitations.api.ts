import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { ApiResponse } from '~/shared/api/base.models';
import { ClientInvitation, InvitationsResponse } from '~/shared/api/invitations.models';

/**
 * InvitationsApi Send invitation(s) to the client(s).
 * The service requires the current user to be authenticated using
 * AuthServiceProvider.
 */
@Injectable()
export class InvitationsApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker) {
    super(http, logger, serverStatus);
  }

  /**
   * Sends invitation(s) to the provided client(s). The stylist must be already authenticated as a user.
   */
  createInvitations(data: ClientInvitation[]): Observable<ApiResponse<InvitationsResponse>> {
    return this.post<InvitationsResponse>('client/invitations', data);
  }
}
