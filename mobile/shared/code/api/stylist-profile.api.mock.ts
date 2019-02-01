import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base.service.mock';
import { randomPhone } from '~/shared/utils/test-utils';
import { RatingResponse, StylistProfileResponse } from './stylists.models';

@Injectable()
export class StylistProfileApiMock extends BaseServiceMock {

  getStylistProfile(): Observable<ApiResponse<StylistProfileResponse>> {
    const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];

    return this.mockRequest<StylistProfileResponse>(
        Observable.create(observer => {
          observer.next({
            uuid: faker.random.uuid(),
            first_name: name,
            last_name: lastName,
            profile_photo_url: undefined,
            is_preferred: true,
            preference_uuid: faker.random.uuid(),
            salon_name: faker.commerce.productName(),
            salon_address: faker.address.streetAddress(),
            followers_count: faker.random.number(),
            instagram_url: faker.helpers.slugify(`${name}${lastName}`),
            instagram_integrated: true,
            website_url: faker.helpers.userCard().website,
            email: faker.internet.email(),
            phone: randomPhone(),
            is_profile_bookable: true,
            working_hours: {
              weekdays: []
            },
            rating_percentage: faker.random.number({min: 0, max: 1})
          });
        })
    );
  }

  getClientsFeedBack(): Observable<ApiResponse<RatingResponse>> {
    return this.mockRequest<RatingResponse>(
        Observable.create(observer => {
          observer.next({
            rating: [
              {
                client_name: faker.name.firstName(),
                client_photo_url: undefined,
                rating: faker.random.number({min: 0, max: 1}),
                appointment_datetime: faker.date.recent(),
                comment: faker.lorem.paragraph()
              },
              {
                client_name: faker.name.firstName(),
                client_photo_url: undefined,
                rating: faker.random.number({min: 0, max: 1}),
                appointment_datetime: faker.date.recent(),
                comment: faker.lorem.paragraph()
              }
            ]
          });
        })
    );
  }
}
