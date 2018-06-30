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
    this.trackerInit = this.ga.startTrackerWithId(id);

    // return as is to be able to handle errors outside of init
    return this.trackerInit;
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

  private call(func: TrackingFunction): void {
    if (!this.trackerInit) {
      this.logger.error('You are trying to use Google Analytics before initializing it');
      return;
    }
    this.trackerInit
      .then(func)
      .catch(() => {
        this.logger.warn('Google Analytics initializing failed (this is expected if not on the phone)');
      });
  }
}
