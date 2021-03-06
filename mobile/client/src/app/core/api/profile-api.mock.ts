import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { BaseServiceMock } from '~/shared/api/base.service.mock';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/shared/api/base.models';

import { randomPhone } from '~/shared/utils/test-utils';

export const profileNotCompleate = {
  phone: randomPhone(),
  first_name: 'First',
  last_name: 'Last',
  zip_code: faker.random.number({min: 10000, max: 999999}),
  email: `test_profile+${faker.name.firstName()}@madebeauty.com`,
  city: '',
  state: '',
  instagram_url: ''
};

@Injectable()
export class ProfileApiMock extends BaseServiceMock {

  getProfile(): Observable<ApiResponse<ProfileModel>> {
    return this.mockRequest<ProfileModel>(
      Observable.create(observer => {
        const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
        const slug = faker.helpers.slugify(`${name}${lastName}`);
        observer.next({
          phone: randomPhone(),
          first_name: name,
          last_name: lastName,
          zip_code: Number(Math.random() * Math.pow(10, 6)),
          email: `test_profile+${slug}@madebeauty.com`,
          city: 'Brooklyn',
          state: 'NY',
          profile_photo_url: faker.random.image(),
          instagram_url: slug,
          privacy: 'public'
        });
      })
    );
  }

  updateProfile(profile: ProfileModel): Observable<ApiResponse<ProfileModel>> {
    return this.mockRequest<ProfileModel>(
      Observable.create(observer => {
        observer.next(profile);
        observer.complete();
      })
    );
  }
}
