import * as faker from 'faker';
import * as moment from 'moment';

import { Injectable } from '@angular/core';
import { AppointmentDateOffer } from '~/today/today.models';

export const datesMock: AppointmentDateOffer[] =
  Array(14).fill(undefined).map((_, i) => ({
    date: moment().add(i, 'days').format(),
    price: Number(faker.commerce.price())
  }));

@Injectable()
export class AppointmentDatesServiceMock {

  async getDates(): Promise<AppointmentDateOffer[]> {
    return Promise.resolve(datesMock);
  }
}
