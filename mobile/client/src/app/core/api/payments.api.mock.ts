import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { HttpErrorResponse } from '@angular/common/http';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base.service.mock';
import { ApiRequestOptions } from '~/shared/api-errors';

import {
  AddPaymentMethodRequest,
  GetPaymentMethodsResponse,
  PaymentMethod,
  PaymentType
} from '~/core/api//payments.models';

import { StripeCardBrand } from '~/payment/stripe.models';

export const paymentMethodMock = {
  uuid: faker.random.uuid,
  type: PaymentType.Card,
  card_brand: StripeCardBrand.Visa,
  card_last4: '4242'
};

@Injectable()
export class PaymentsApiMock extends BaseServiceMock {

  static testPaymentMethod;

  getPaymentMethods(): Observable<ApiResponse<GetPaymentMethodsResponse>> {
    const paymentMethods =
      PaymentsApiMock.testPaymentMethod ? [PaymentsApiMock.testPaymentMethod] : [];

    return this.mockRequest<GetPaymentMethodsResponse>(
      Observable.create(observer => {
        observer.next({ payment_methods: paymentMethods });
        observer.complete();
      })
    );
  }

  addPaymentMethod(data: AddPaymentMethodRequest, options: ApiRequestOptions = {}): Observable<ApiResponse<PaymentMethod>> {
    // Simulate adding payment method
    PaymentsApiMock.testPaymentMethod = paymentMethodMock;

    return this.mockRequest<PaymentMethod>(
      Observable.create(observer => {
        observer.next(PaymentsApiMock.testPaymentMethod);
        observer.complete();
      })
    );
  }

  throwBillingError(options: ApiRequestOptions = {}): Observable<ApiResponse<any>> {
    return this.prepareResponse('', '',
      Observable.create(() => {
        throw new HttpErrorResponse({
          status: 400,
          error: {
            code: 'err_api_exception',
            non_field_errors: [{
              code: 'err_actionable_billing_error_with_message',
              message: 'some verbose message'
            }]
          }
        });
      }), options
    );
  }
}
