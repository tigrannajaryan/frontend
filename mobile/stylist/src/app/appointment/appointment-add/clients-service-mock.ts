import { Injectable } from '@angular/core';
import * as faker from 'faker';

import { Client } from './clients-models';

export const clientsMock: Client[] =
  Array(20).fill(undefined).map(() => ({
    uuid: faker.random.uuid(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    phone: faker.phone.phoneNumber()
  }));

@Injectable()
export class ClientsServiceMock {

  async search(query: string): Promise<Client[]> {
    return Promise.resolve(clientsMock);
  }
}
