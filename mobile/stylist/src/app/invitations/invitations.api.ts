import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseApiService } from '~/shared/base-api-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

import { ClientInvitation } from './invitations.models';

export interface InvitationsResponse {
  invitations: ClientInvitation[];
}

/**
 * InvitationsApi Send invitation(s) to the client(s).
 * The service requires the current user to be authenticated using
 * AuthServiceProvider.
 */
@Injectable()
export class InvitationsApi extends BaseApiService {

  constructor(
    public http: HttpClient,
    public logger: Logger,
    protected serverStatus: ServerStatusTracker) {
    super(http, logger, serverStatus);
  }

  /**
   * Sends invitation(s) to the provided client(s). The stylist must be already authenticated as a user.
   */
  async sendInvitations(data: ClientInvitation[]): Promise<InvitationsResponse> {
    return this.post<InvitationsResponse>('stylist/invitations', data);
  }

  /**
   * Return the list of previously sent invitations.
   */
  async getInvitations(): Promise<InvitationsResponse> {
    // return this.get<InvitationsResponse>('stylist/invitations');
    return Promise.resolve({
      invitations: [{ phone: '+1 (416) 854-3791', status: 'invited' }, { phone: ' +14168547436', status: 'accepted' }]
    });
  }
}
