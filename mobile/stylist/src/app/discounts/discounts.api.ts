import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseApiService } from '~/core/base-api-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { Discounts } from './discounts.models';
import { MaximumDiscounts } from '~/discounts/discounts.models';

/**
 * DiscountsApi allows getting and setting the discount for stylist.
 */
@Injectable()
export class DiscountsApi extends BaseApiService {

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  /**
   * Get the discounts of the stylist. The stylist must be already authenticated as a user.
   */
  async getDiscounts(): Promise<Discounts> {
    return this.get<Discounts>('stylist/discounts');
  }

  /**
   * Get the maximum discounts of the stylist. The stylist must be already authenticated as a user.
   */
  async getMaximumDiscounts(): Promise<MaximumDiscounts> {
    return this.get<MaximumDiscounts>('stylist/maximum-discount');
  }

  /**
   * Set discounts to stylist. The stylist must be already authenticated as a user.
   */
  async setDiscounts(discounts: Discounts): Promise<Discounts> {
    return this.patch<Discounts>('stylist/discounts', discounts);
  }

  /**
   * Set maximum discounts to stylist. The stylist must be already authenticated as a user.
   */
  async setMaximumDiscounts(maximumDiscounts: MaximumDiscounts): Promise<MaximumDiscounts> {
    return this.post<MaximumDiscounts>('stylist/maximum-discount', maximumDiscounts);
  }
}
