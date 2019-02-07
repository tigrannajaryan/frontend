import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ApiResponse } from '~/shared/api/base.models';
import { BaseService } from '~/shared/api/base.service';

import {
  AddPaymentMethodRequest,
  GetPaymentMethodsResponse,
  PaymentMethod
} from '~/core/api/payments.models';

@Injectable()
export class PaymentsApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getPaymentMethods(): Observable<ApiResponse<GetPaymentMethodsResponse>> {
    return this.get<GetPaymentMethodsResponse>('client/payment-methods');
  }

  addPaymentMethod(data: AddPaymentMethodRequest): Observable<ApiResponse<PaymentMethod>> {
    return this.put<PaymentMethod>('client/payment-methods', data);
  }
}
