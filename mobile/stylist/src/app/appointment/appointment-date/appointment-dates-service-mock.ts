import * as faker from 'faker';
import * as moment from 'moment';

import { Injectable } from '@angular/core';

import { Client } from '~/appointment/appointment-add/clients-models';

export interface AppointmentDate {
  date: string; // ISO 8601 date
  price: number;
}

export const datesMock: AppointmentDate[] =
  Array(14).fill(undefined).map((_, i) => ({
    date: moment().add(i, 'days').format(),
    price: Number(faker.commerce.price())
  }));

@Injectable()
export class AppointmentDatesServiceMock {

  async getDates(): Promise<AppointmentDate[]> {
    return Promise.resolve(datesMock);
  }
}
