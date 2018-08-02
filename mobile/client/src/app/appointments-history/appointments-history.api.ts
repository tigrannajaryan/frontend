import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import { AppointmentsResponse } from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsHistoryApi extends BaseService {

  getHistory(): Observable<ApiResponse<AppointmentsResponse>> {
    const params: HttpParams = new HttpParams();
    const yesterdayYMD = moment(moment().subtract(1, 'days')).format('YYYY-MM-DD');
    params.set('date_to', yesterdayYMD);
    return this.get<AppointmentsResponse>('client/appointments', params);
  }
}
