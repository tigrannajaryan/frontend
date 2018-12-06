import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform } from 'ionic-angular';
import * as moment from 'moment';
import v4 from 'uuid/v4';

import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { Logger } from '~/shared/logger';
import { ApiRequestOptions } from '~/shared/api-errors';
import { getAppVersionNumber, getBuildNumber } from '~/shared/get-build-info';
import { PlatformNames } from '~/shared/constants';

import { BaseService } from './base.service';
import { ISODateTime } from './base.models';
import { UserRole } from './auth.models';

interface AnalyticsStartSession {
  timestamp: ISODateTime;
  session_uuid: string;
  role: UserRole;
  app_os: PlatformNames;
  app_version: string;
  app_build: number;
  extra_data?: any;
}

interface AnalyticsEvent {
  timestamp: ISODateTime;
  session_uuid: string;
  extra_data?: any;
}

interface AnalayticsEventView extends AnalyticsEvent {
  view_title: string;
}

/**
 * Analytics class which sends tracking data to Made backend.
 */
@Injectable()
export class MadeAnalyticsApi extends BaseService {

  private sessionId: string = v4();
  private platformName: PlatformNames;
  private sessionInited: Promise<void>;

  constructor(
    http: HttpClient,
    logger: Logger,
    platform: Platform,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
    this.logger.info(`Starting analytics session ${this.sessionId}`);
    this.platformName = platform.is(PlatformNames.ios) ? PlatformNames.ios : PlatformNames.android;
    this.startSession();
  }

  startSession(): void {
    const request: AnalyticsStartSession = {
      ...this.composeEvent(),
      role: BaseService.role,
      app_version: getAppVersionNumber(),
      app_build: parseInt(getBuildNumber(), 10),
      app_os: this.platformName
    };
    this.sessionInited = this.callAnalyticsApi('common/analytics/sessions', request);
  }

  async trackView(viewTitle: string): Promise<void> {
    await this.sessionInited;
    const request: AnalayticsEventView = { ...this.composeEvent(), view_title: viewTitle };
    return this.callAnalyticsApi('common/analytics/views', request);
  }

  private async callAnalyticsApi(apiUrl: string, request: any): Promise<void> {
    try {
      const options: ApiRequestOptions = {
        // Don't show any errors, analytics are not user-visible feature.
        hideAllErrors: true
      };
      await this.post<void>(apiUrl, request, undefined, options).first().toPromise();
    } catch {
      // Ignore analytics errors
    }
  }

  private composeEvent(): AnalyticsEvent | undefined {
    try {
      return { timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'), session_uuid: this.sessionId };
    } catch {
      // Ignore analytics errors
      return undefined;
    }
  }
}
