import { Injectable } from '@angular/core';
import { BaseApiService } from '../shared/base-api-service';
import { HttpClient } from '@angular/common/http';
import { Logger } from '../shared/logger';
import { ServerStatusTracker } from '../shared/server-status-tracker';

const apiUrl = 'stylist/discounts';

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
   * Set the discounts of the stylist. The stylist must be already authenticated as a user.
   */
  async getDiscounts(): Promise<Discounts> {
    return this.get<Discounts>(apiUrl);
  }

  /**
   * Set discounts to stylist. The stylist must be already authenticated as a user.
   */
  async setDiscounts(discounts: Discounts): Promise<Discounts> {
    return this.post<Discounts>(apiUrl, discounts);
  }
}
