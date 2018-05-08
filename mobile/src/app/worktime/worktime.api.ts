import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseServiceProvider } from '../../providers/base-service';
import { Worktime } from './worktime.models';
import { Logger } from '../shared/logger';

/**
 * WorktimeApi allows getting and setting the working time for stylist.
 */
@Injectable()
export class WorktimeApi extends BaseServiceProvider {

  constructor(
    public http: HttpClient,
    public logger: Logger) {
    super(http, logger);
  }

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async getWorktime(): Promise<Worktime> {
    return this.get<Worktime>('stylist/availability/weekdays');
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  async setWorktime(data: Worktime): Promise<Worktime> {
    return this.post<Worktime>('stylist/availability/weekdays', data.weekdays);
  }
}
