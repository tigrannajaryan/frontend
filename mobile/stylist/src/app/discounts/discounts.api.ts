import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Logger } from '../shared/logger';
import { BaseServiceProvider } from '../shared/base-service';

const apiUrl = 'stylist/discounts';

/**
 * DiscountsApi allows getting and setting the discount for stylist.
 */
@Injectable()
export class DiscountsApi extends BaseServiceProvider {

  constructor(
    public http: HttpClient,
    public logger: Logger) {
    super(http, logger);
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
