import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { Worktime } from './worktime.models';
import { BaseApiService } from '~/shared/stylist-api/base-api-service';

/**
 * WorktimeApi allows getting and setting the working time for stylist.
 */
@Injectable()
export class WorktimeApi extends BaseApiService {

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  /**
   * Get the working hours of the stylist. The stylist must be already authenticated as a user.
   */
  async getWorktime(): Promise<Worktime> {
    return this.get<Worktime>('stylist/availability/weekdays');
  }

  /**
   * Sets the working hours of the stylist. The stylist must be already authenticated as a user.
   */
  async setWorktime(data: Worktime): Promise<Worktime> {
    return this.post<Worktime>('stylist/availability/weekdays', data.weekdays);
  }
}