import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { BaseServiceMock } from '~/core/api/base-service.mock';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';

@Injectable()
export class ProfileServiceMock extends BaseServiceMock {

  getProfile(): Observable<ApiResponse<ProfileModel>> {
    return this.mockRequest<ProfileModel>(
      Observable.create(observer => {
        const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
        const slug = faker.helpers.slugify(`${name}${lastName}`);
        observer.next({
          phone: `+1347${(Math.random() * Math.pow(10, 7)).toFixed()}`,
          first_name: name,
          last_name: lastName,
          zip_code: Number(Math.random() * Math.pow(10, 6)),
          email: `${slug}@gmail.com`
        });
      })
    );
  }

  updateProfile(profile: ProfileModel): Observable<ApiResponse<ProfileModel>> {
    return this.mockRequest<ProfileModel>(
      Observable.create(observer => {
        observer.next(profile);
      })
    );
  }
}
