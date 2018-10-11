import * as faker from 'faker';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base-service.mock';
import { ClientDetailsModel } from '~/shared/stylist-api/clients-api.models';

export const clientDetailsMock: ClientDetailsModel = {
    uuid: faker.random.uuid(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
    city: faker.address.city(),
    state: faker.address.state(),
    photo: faker.image.imageUrl(),
    email: faker.internet.email(),
    last_visit_datetime: new Date().toISOString(),
    last_services_names: [faker.lorem.word(), faker.lorem.word()]
};

@Injectable()
export class ClientDetailsApiMock extends BaseServiceMock {
    getClientDetails(): Observable<ApiResponse<ClientDetailsModel>> {
        return this.mockRequest<ClientDetailsModel>(
            Observable.create(observer => {
                observer.next(clientDetailsMock);
                observer.complete();
            })
        );
    }
}
