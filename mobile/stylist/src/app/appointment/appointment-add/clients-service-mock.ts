import { Injectable } from '@angular/core';
import * as faker from 'faker';

import { Client } from '~/appointment/appointment-add/clients-models';
import { ClientsSearchResponse } from '~/appointment/appointment-add/clients-service';

export const clientsMock: Client[] =
  Array(20).fill(undefined).map(() => ({
    uuid: faker.random.uuid(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    phone: faker.phone.phoneNumber()
  }));

@Injectable()
export class ClientsServiceMock {

  async search(query: string): Promise<ClientsSearchResponse> {
    const clients = clientsMock.filter(client =>
      `${client.first_name} ${client.last_name}`.includes(query.trim())
    );
    return Promise.resolve({ clients });
  }
}
