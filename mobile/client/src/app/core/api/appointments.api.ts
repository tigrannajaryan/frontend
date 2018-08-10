import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import { AppointmentsHistoryResponse, HomeResponse } from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsApi extends BaseService {

  getHome(): Observable<ApiResponse<HomeResponse>> {
    const params: HttpParams = new HttpParams();
    const yesterdayYMD = moment(moment().subtract(1, 'days')).format('YYYY-MM-DD');
    params.set('date_from', yesterdayYMD);
    return this.get<HomeResponse>('client/home', params);
  }

  getHistory(): Observable<ApiResponse<AppointmentsHistoryResponse>> {
    const params: HttpParams = new HttpParams();
    const yesterdayYMD = moment(moment().subtract(1, 'days')).format('YYYY-MM-DD');
    params.set('date_to', yesterdayYMD);
    return this.get<AppointmentsHistoryResponse>('client/appointments', params);
  }
}
