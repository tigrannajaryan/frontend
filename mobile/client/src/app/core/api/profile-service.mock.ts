import {BaseServiceMock} from '~/core/api/base-service.mock';
import {ProfileModel} from '~/core/api/profile.models';
import * as faker from 'faker';

const profile: ProfileModel = {
  id: faker.random.number(),
  phone: faker.phone.phoneNumber(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  zip_code: faker.random.number.random(),
  birthday: faker.random.date.past
};
export class ProfileServiceMock extends BaseServiceMock {

  public getProfile(): Promise<ProfileModel> {
    return Promise.resolve(profile);
  }

  public updateProfile(profile: ProfileModel) {
    return Promise.resolve(profile);
  }

}
