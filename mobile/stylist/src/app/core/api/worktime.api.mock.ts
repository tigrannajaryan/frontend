import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ApiResponse } from '~/shared/api/base.models';
import { Worktime } from '~/shared/api/worktime.models';

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
}
