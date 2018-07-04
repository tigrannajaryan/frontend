import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AppVersion } from '@ionic-native/app-version';

import { getBuildNumber } from '~/core/functions';

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
    private verProvider: AppVersion
  ) {
  }

  async init(id: string): Promise<void> {
    try {
      await this.ga.startTrackerWithId(id);
    } catch (e) {
      this.failed = true;
      throw e;
    }

    let appVersion: string;
    try {
      appVersion = await this.verProvider.getVersionNumber();
    } catch (e) {
      // Most likely running in browser so Cordova is not available. Ignore the error.
      appVersion = 'Unknown';
    }

    const fullVer = `${appVersion}.${getBuildNumber()}`;
    this.ga.setAppVersion(fullVer);

    // Execute all pending calls
    for (const func of this.pendingCalls) {
      func();
    }
    this.pendingCalls = [];

    // We are now ready to perform direct GA calls
    this.ready = true;
  }

  setUserId(userId: string): void {
    this.execWhenReady(() => this.ga.setUserId(userId));
  }

  trackView(title: string, campaignUrl?: string, newSession?: boolean): void {
    this.execWhenReady(() => this.ga.trackView(title, campaignUrl, newSession));
  }

  trackTiming(category: string, intervalInMilliseconds: number, variable: string, label: string): void {
    this.execWhenReady(() => this.ga.trackTiming(category, intervalInMilliseconds, variable, label));
  }

  protected async execWhenReady(func: Function): Promise<void> {
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
