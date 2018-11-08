import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { AckNotificationRequest, RegUnregDeviceRequest } from './notifications.api';

@Injectable()
export class NotificationsApiMock {

  registerDevice(request: RegUnregDeviceRequest): Observable<ApiResponse<void>> {
    return Observable.of({ response: undefined });
  }

  unregisterDevice(request: RegUnregDeviceRequest): Observable<ApiResponse<void>> {
    return Observable.of({ response: undefined });
  }

  ackNotification(request: AckNotificationRequest): Observable<ApiResponse<void>> {
    return Observable.of({ response: undefined });
  }
}
