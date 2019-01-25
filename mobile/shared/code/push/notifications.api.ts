import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Logger } from '~/shared/logger';
import { BaseService } from '~/shared/api/base.service';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { UserRole } from '~/shared/api/auth.models';
import { ApiResponse } from '~/shared/api/base.models';
import { ApiRequestOptions } from '~/shared/api-errors';

export type PushDeviceType = 'apns' | 'fcm';

export interface RegUnregDeviceRequest {
  user_role: UserRole;
  device_registration_id: string;
  device_type: PushDeviceType;
  is_development_build: boolean;
}

export interface AckNotificationRequest {
  message_uuids: string[];
}

// Hide errors returned by APIs. There is no point in showing them to the user since the
// user cannot do anything about them.
const options: ApiRequestOptions = { hideGenericAlertOnFieldAndNonFieldErrors: true };

@Injectable()
export class NotificationsApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  registerDevice(request: RegUnregDeviceRequest): Observable<ApiResponse<void>> {
    return this.post<void>('common/register-device', request, undefined, options);
  }

  unregisterDevice(request: RegUnregDeviceRequest): Observable<ApiResponse<void>> {
    return this.post<void>('common/unregister-device', request, undefined, options);
  }

  ackNotification(request: AckNotificationRequest): Observable<ApiResponse<void>> {
    return this.post<void>('common/ack-push', request, undefined, options);
  }
}
