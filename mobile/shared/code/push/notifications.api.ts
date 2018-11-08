import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { BaseService } from '~/shared/api/base.service';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { UserRole } from '~/shared/api/auth.models';
import { ApiResponse } from '~/shared/api/base.models';

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
    return this.post<void>('common/register-device', request);
  }

  unregisterDevice(request: RegUnregDeviceRequest): Observable<ApiResponse<void>> {
    return this.post<void>('common/unregister-device', request);
  }

  ackNotification(request: AckNotificationRequest): Observable<ApiResponse<void>> {
    return this.post<void>('common/ack-push', request);
  }
}
