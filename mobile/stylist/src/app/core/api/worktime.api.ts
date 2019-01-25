import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import * as deepEqual from 'fast-deep-equal';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { ApiResponse, isoDateFormat } from '~/shared/api/base.models';
import { WorkdayAvailability, Worktime } from '~/shared/api/worktime.models';
import { ApiClientError, ApiRequestOptions, HttpStatus } from '~/shared/api-errors';
import { map } from 'rxjs/operators';

/**
 * WorktimeApi allows getting and setting the working time for stylist.
 */
@Injectable()
export class WorktimeApi extends BaseService {

  static specialAvailabilityNotSetError = new ApiClientError(HttpStatus.notFound, {
    code: 'not_found',
    non_field_errors: [{
      code: 'err_stylist_special_availability_date_not_found'
    }]
  });

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
  setWorkdayAvailable(date: moment.Moment, isAvailable: boolean): Observable<ApiResponse<WorkdayAvailability>> {
    const isoDate = date.format(isoDateFormat);
    const data: WorkdayAvailability = { is_available: isAvailable };

    return this.post<WorkdayAvailability>(`stylist/availability/special/${isoDate}`, data);
  }

  getWorkdayAvailable(date: moment.Moment): Observable<ApiResponse<WorkdayAvailability>> {
    const isoDate = date.format(isoDateFormat);
    const options: ApiRequestOptions = {
      hideGenericAlertOnErrorsLike: [WorktimeApi.specialAvailabilityNotSetError]
    };

    return (
      this.get<WorkdayAvailability>(`stylist/availability/special/${isoDate}`, undefined, options)
        .pipe(
          map(({ response, error }) => {

            const suppressError =
              error && WorktimeApi.specialAvailabilityNotSetError.isLike(error) &&
              deepEqual(WorktimeApi.specialAvailabilityNotSetError.errorBody, (error as ApiClientError).errorBody);

            if (suppressError) {
              // Return no error if special avilabilty remains avilable:
              return { response: { is_available: true }, error: undefined };
            }
            return { response, error };
          })
        )
    );
  }
}
