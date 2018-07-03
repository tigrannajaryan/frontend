import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

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
    private ga: GoogleAnalytics
  ) {
  }

  async init(id: string): Promise<void> {
    try {
      await this.ga.startTrackerWithId(id);
      this.ready = true;

    } catch (e) {
      this.failed = true;
      throw e;
    }

    // Execute all pending calls
    for (const func of this.pendingCalls) {
      func();
    }
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
