import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '~/shared/api/base.service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ApiResponse } from '~/shared/api/base.models';
import { Discounts, MaximumDiscounts } from './discounts.models';

/**
 * DiscountsApi allows getting and setting the discount for stylist.
 */
@Injectable()
export class DiscountsApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  /**
   * Get the discounts of the stylist. The stylist must be already authenticated as a user.
   */
  getDiscounts(): Observable<ApiResponse<Discounts>> {
    return this.get<Discounts>('stylist/discounts');
  }

  /**
   * Get the maximum discounts of the stylist. The stylist must be already authenticated as a user.
   */
  getMaximumDiscounts(): Observable<ApiResponse<MaximumDiscounts>> {
    return this.get<MaximumDiscounts>('stylist/maximum-discount');
  }

  /**
   * Set discounts to stylist. The stylist must be already authenticated as a user.
   */
  setDiscounts(discounts: Discounts): Observable<ApiResponse<Discounts>> {
    return this.patch<Discounts>('stylist/discounts', discounts);
  }

  /**
   * Set maximum discounts to stylist. The stylist must be already authenticated as a user.
   */
  setMaximumDiscounts(maximumDiscounts: MaximumDiscounts): Observable<ApiResponse<MaximumDiscounts>> {
    return this.post<MaximumDiscounts>('stylist/maximum-discount', maximumDiscounts);
  }
}
