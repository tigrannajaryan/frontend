import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { ViewController } from 'ionic-angular';
import * as camelcase from 'camelcase';

import { getAppVersionNumber, getBuildNumber } from '~/shared/get-build-info';
import { Logger } from '~/shared/logger';
import { MadeAnalyticsApi } from '~/shared/api/made-analytics.api';

/**
 * Internal App Analytics class which sends analytics data to Google Analytics
 * and to Made Analytics
 */
@Injectable()
export class AppAnalytics {
  private gaReady = false;
  private gaFailed = false;
  private gaPendingCalls: Function[] = [];

  constructor(
    private analytics: GoogleAnalytics,
    private logger: Logger,
    private madeAnalytics: MadeAnalyticsApi
  ) {
  }

  /**
   * Initialize Google Analytics. Any tracking calls made before this intialization are
   * queued and if this initialization is successful are immediately sent to GA.
   */
  async init(gaId: string): Promise<void> {
    if (gaId === undefined) {
      this.logger.info('Analytics: No Google Analytics tracking ID defined. Disabling Google Analytics.');
      this.gaFailed = true;
      return;
    }

    this.logger.info(`Analytics: Initializing Google Analytics with id=${gaId}...`);

    try {
      await this.analytics.startTrackerWithId(gaId);
      await this.initAppVer();

      // Execute all pending calls
      for (const func of this.gaPendingCalls) {
        func();
      }
      this.gaPendingCalls = [];

      // We are now ready to perform direct GA calls
      this.gaReady = true;

      this.logger.info('Analytics: Google Analytics is ready now');
    } catch (e) {
      this.gaFailed = true;
      this.logger.warn('Analytics: Error starting Google Analytics (this is expected if not on the phone):', e);
    }
  }

  trackViewChange(view: ViewController): void {
    try {
      // Get page name from the HTML native element's tagName property. This is the best we have at runtime.
      // Class name, ids, etc. are all uglified by AOT compiler in production build.
      const pageRef = view.pageRef();
      let viewName: string = (pageRef && pageRef.nativeElement && pageRef.nativeElement.tagName) ?
        pageRef.nativeElement.tagName : 'unknown';

      // Remove 'PAGE-' prefix and convert to PascalCase for better readability of GA results.
      viewName = viewName.replace(/^PAGE-/, '');
      viewName = camelcase(viewName, { pascalCase: true });

      this.trackView(viewName);
    } catch (e) {
      // We have an unclear case of runtime error in Sentry
      // https://sentry.io/madebeauty/mobile-client-staging/issues/723651505/
      // So we just play defensive here and catch exceptions and log them.
      this.logger.warn('Error in trackViewChange', e);
    }
  }

  setUserId(userId: string): void {
    this.execWhenGaReady(() => this.analytics.setUserId(userId));
  }

  trackView(title: string, campaignUrl?: string, newSession?: boolean): void {
    this.logger.info(`Analytics: Entered ${title}`);
    this.madeAnalytics.trackView(title);
    this.execWhenGaReady(() => this.analytics.trackView(title, campaignUrl, newSession));
  }

  trackTiming(category: string, intervalInMilliseconds: number, variable: string, label: string): void {
    this.execWhenGaReady(() => this.analytics.trackTiming(category, intervalInMilliseconds, variable, label));
  }

  private async initAppVer(): Promise<void> {
    const fullVer = `${getAppVersionNumber()}.${getBuildNumber()}`;
    this.analytics.setAppVersion(fullVer);
  }

  private async execWhenGaReady(func: Function): Promise<void> {
    if (this.gaReady) {
      func();
      return;
    }

    if (this.gaFailed) {
      // GA failed to initialize. Ignore all calls.
      return;
    }

    // GA init not ready. Add call to pending list.
    this.gaPendingCalls.push(func);
  }
}
