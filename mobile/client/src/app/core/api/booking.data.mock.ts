import { Injectable } from '@angular/core';

import { LoggerMock } from '~/shared/logger.mock';

import { BookingApiMock } from './booking.api.mock';
import { BookingData } from './booking.data';
import { ServicesServiceMock } from './services.service.mock';

/**
 * Singleton that stores current booking process data.
 */
@Injectable()
export class BookingDataMock extends BookingData {
  constructor() {
    super(
      new BookingApiMock(),
      new ServicesServiceMock(),
      new LoggerMock()
    );
  }
}
