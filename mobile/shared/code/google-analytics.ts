import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AppVersion } from '@ionic-native/app-version';
import { ViewController } from 'ionic-angular';

import { getBuildNumber } from '~/shared/get-build-number';
import { Logger } from '~/shared/logger';

/**
 * Wrapper class for Google Analytics which initializes it
 * and can defer calls until the initializtion is ready or
 * skip calls if initialization fails.
 */
@Injectable()
export class GAWrapper {
  private ready = false;
  private failed = false;
  private pendingCalls: Function[] = [];

  constructor(
    private ga: GoogleAnalytics,
    private verProvider: AppVersion,
    private logger: Logger
  ) {
  }

  async init(id: string): Promise<void> {
    if (id === undefined) {
      this.logger.info('GA: No tracking ID defined. Disabling Google Analytics.');
      this.failed = true;
      return;
    }

    this.logger.info(`GA: Initializing Google Analytics with id=${id}...`);

    try {
      await this.ga.startTrackerWithId(id);
      await this.initAppVer();

      // Execute all pending calls
      for (const func of this.pendingCalls) {
        func();
      }
      this.pendingCalls = [];

      // We are now ready to perform direct GA calls
      this.ready = true;

      this.logger.info('GA: Google Analytics is ready now');
    } catch (e) {
      this.failed = true;
      this.logger.warn('GA: Error starting Google Analytics (this is expected if not on the phone):', e);
    }
  }

  trackViewChange(view: ViewController): void {
    const viewComponentName: string = view ? view.id : 'unknown';

    // Remove 'Component' suffix for better readability of GA results.
    const viewName = viewComponentName.replace(/Component$/, '');
    this.trackView(viewName);
  }

  setUserId(userId: string): void {
    this.execWhenReady(() => this.ga.setUserId(userId));
  }

  trackView(title: string, campaignUrl?: string, newSession?: boolean): void {
    this.logger.info(`GA: Entered ${title}`);
    this.execWhenReady(() => this.ga.trackView(title, campaignUrl, newSession));
  }

  trackTiming(category: string, intervalInMilliseconds: number, variable: string, label: string): void {
    this.execWhenReady(() => this.ga.trackTiming(category, intervalInMilliseconds, variable, label));
  }

  private async initAppVer(): Promise<void> {
    let appVersion: string;
    try {
      appVersion = await this.verProvider.getVersionNumber();
    } catch (e) {
      // Most likely running in browser so Cordova is not available. Ignore the error.
      appVersion = 'Unknown';
    }

    const fullVer = `${appVersion}.${getBuildNumber()}`;
    this.ga.setAppVersion(fullVer);
  }

  private async execWhenReady(func: Function): Promise<void> {
    if (this.ready) {
      func();
      return;
    }

    if (this.failed) {
      // GA failed to initialize. Ignore all calls.
      return;
    }

    // GA init not ready. Add call to pending list.
    this.pendingCalls.push(func);
  }
}
