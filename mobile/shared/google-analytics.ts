import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Logger } from '~/shared/logger';

type TrackingFunction = (...args: any[]) => void;

/**
 * Wrapper class for Google Analytics which initializes it
 * and can defer calls until the initializtion is ready or
 * skip calls if initialization fails.
 */
@Injectable()
export class GAWrapper {
  private ready = false;
  private failed = false;

  private trackerInit: Promise<void>;

  constructor(
    private ga: GoogleAnalytics,
    private logger: Logger
  ) {
  }

  init(id: string): Promise<void> {
    this.trackerInit = this.ga.startTrackerWithId(id).catch(() => {
      this.logger.error('Google Analytics initializing failed');
    });
    return this.trackerInit;
  }

  call(func: TrackingFunction): void {
    if (!this.trackerInit) {
      this.logger.error('You are trying to use Google Analytics before initializing it');
      return;
    }
    this.trackerInit.then(func);
  }

  setUserId(userId: string): void {
    this.call(() => {
      this.ga.setUserId(userId);
    });
  }

  trackView(title: string, campaignUrl?: string, newSession?: boolean): void {
    this.call(() => {
      this.ga.trackView(title, campaignUrl, newSession);
    });
  }

  trackTiming(category: string, intervalInMilliseconds: number, variable: string, label: string): void {
    this.call(() => {
      this.ga.trackTiming(category, intervalInMilliseconds, variable, label);
    });
  }
}
