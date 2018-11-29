import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { ApiResponse } from '~/shared/api/base.models';
import { WorkdayAvailability, Worktime } from '~/shared/api/worktime.models';

/**
 * WorktimeApi allows getting and setting the working time for stylist.
 */
@Injectable()
export class WorktimeApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  /**
   * Get the working hours of the stylist. The stylist must be already authenticated as a user.
   */
  getWorktime(): Observable<ApiResponse<Worktime>> {
    return this.get<Worktime>('stylist/availability/weekdays');
  }

  /**
   * Sets the working hours of the stylist. The stylist must be already authenticated as a user.
   */
  setWorktime(data: Worktime): Observable<ApiResponse<Worktime>> {
    return this.post<Worktime>('stylist/availability/weekdays', data.weekdays);
  }

  /**
   * Set availability of a workday
   */
  setWorkdayAvailable(date: moment.Moment | Date | string, isAvailable: boolean): Observable<ApiResponse<WorkdayAvailability>> {
    const isoDate = moment(date).format('YYYY-MM-DD');
    const data: WorkdayAvailability = { is_available: isAvailable };

    return this.post<WorkdayAvailability>(`stylist/availability/special/${isoDate}`, data);
  }
}
