import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import 'rxjs/add/observable/of';

import { ApiResponse } from '~/shared/api/base.models';
import { WorkdayAvailability, Worktime } from '~/shared/api/worktime.models';

/**
 * AuthServiceProviderMock provides authentication mocked with one
 * hard-coded set of credentials.
 */
@Injectable()
export class WorktimeApiMock {

  lastSet: Worktime;

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   */
  getWorktime(): Observable<ApiResponse<Worktime>> {
    const worktime: Worktime = {
      weekdays: []
    };

    return Observable.of({ response: worktime });
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  setWorktime(data: Worktime): Observable<ApiResponse<Worktime>> {
    this.lastSet = data;

    return Observable.of({ response: data });
  }

  /**
   * Set availability of a workday
   */
  setWorkdayAvailable(date: moment.Moment, isAvailable: boolean): Observable<ApiResponse<WorkdayAvailability>> {
    const data: WorkdayAvailability = { is_available: isAvailable };

    return Observable.of({ response: data });
  }
}
