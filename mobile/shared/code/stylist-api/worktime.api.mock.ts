import { Injectable } from '@angular/core';
import { Worktime } from './worktime.models';

/**
 * AuthServiceProviderMock provides authentication mocked with one
 * hard-coded set of credentials.
 */
@Injectable()
export class WorktimeApiMock {

  lastSet: Worktime;

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async getWorktime(): Promise<Worktime> {
    const worktime: Worktime = {
      weekdays: []
    };

    return Promise.resolve(worktime);
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  async setWorktime(data: Worktime): Promise<Worktime> {
    this.lastSet = data;

    return Promise.resolve(data);
  }
}
