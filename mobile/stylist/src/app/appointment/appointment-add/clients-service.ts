import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BaseApiService } from '~/shared/base-api-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

import { Client } from '~/appointment/appointment-add/clients-models';

export interface ClientsSearchResponse {
  clients: Client[];
}

@Injectable()
export class ClientsService extends BaseApiService {

  constructor(
    public http: HttpClient,
    public logger: Logger,
    protected serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  /**
   * Search for known clients of a logged in stylist.
   */
  async search(query: string): Promise<ClientsSearchResponse> {
    return this.get<ClientsSearchResponse>(`stylist/search-clients?query=${query}`);
  }
}
