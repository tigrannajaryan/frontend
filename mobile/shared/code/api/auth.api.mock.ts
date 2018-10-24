import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base-service.mock';

import {
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/shared/api/auth.models';

import AuthErrors from '~/core/data/auth.errors.json';

@Injectable()
export class AuthServiceMock extends BaseServiceMock {

  getCode(params: GetCodeParams): Observable<ApiResponse<GetCodeResponse>> {
    return this.mockRequest<ConfirmCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          observer.next({});
        }, 500);
      })
    );
  }

  confirmCode(params: ConfirmCodeParams): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.mockRequest<ConfirmCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
          observer.next({
            token: faker.internet.password(),
            created_at: Number(new Date()),
            stylist_invitation: {
              uuid: faker.random.uuid(),
              first_name: name,
              last_name: lastName,
              salon_name: faker.commerce.productName(),
              salon_address: faker.address.streetAddress(),
              phone: `+1347${(Math.random() * Math.pow(10, 7)).toFixed()}`,
              instagram_url: faker.helpers.slugify(`${name}${lastName}`)
            }
          });
         }, 500);
      })
    );
  }

  /**
   * Returns `AuthErrors.invalid_code` http error from mocked request
   */
  confirmCodeError(params: ConfirmCodeParams): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.mockRequest<ConfirmCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          const error = new HttpErrorResponse({
            headers: new HttpHeaders({}),
            status: 400,
            error: AuthErrors.invalid_code
          });
          observer.error(error);
        });
      })
    );
  }
}
