import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Logger } from '@madebeauty/utils';

import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseApiService } from '~/core/base-api-service';
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
    return this.get<InvitationsResponse>('stylist/invitations');
  }
}
