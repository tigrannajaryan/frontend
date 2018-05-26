import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '../shared/base-api-service';
import { InvitationClient } from './invitations.models';
import { Logger } from '../shared/logger';
import { ServerStatusTracker } from '../shared/server-status-tracker';

export interface InvitationsResponse {
  services: InvitationClient[];
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
  async sendInvitations(data: InvitationClient[]): Promise<InvitationsResponse> {
    return this.post<InvitationsResponse>('stylist/invitations', data);
  }

}
