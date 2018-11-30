import { Injectable } from '@angular/core';
import { BookingData } from './booking.data';
import { BookingApiMock } from './booking.api.mock';
import { ServicesServiceMock } from './services.service.mock';

/**
 * Singleton that stores current booking process data.
 */
@Injectable()
export class BookingDataMock extends BookingData {
  constructor() {
    super(new BookingApiMock(), new ServicesServiceMock());
  }
}
