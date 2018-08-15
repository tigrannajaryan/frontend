import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { DataStore } from '~/core/utils/data-store';
import { PricelistResponse, TimeslotsResponse } from '~/core/api/booking.api';
import { BookingApiMock } from '~/core/api/booking.api.mock';
import { ServiceModel } from '~/core/api/services.models';

function sameServices(l1: ServiceModel[], l2: ServiceModel[]): boolean {
  if (!l1 || !l2) {
    return false;
  }

  if (l1.length !== l2.length) {
    return false;
  }

  for (let i = 0; i < l1.length; i++) {
    if (l1[i].uuid !== l2[i].uuid) {
      return false;
    }
  }

  return true;
}

/**
 * Singleton that stores current booking process data.
 */
@Injectable()
export class BookingData {
  selectedTime: moment.Moment;

  private _stylistUuid: string;
  private _selectedServices: ServiceModel[];
  private _date: Date;
  private _totalClientPrice: number;
  private _pricelist: DataStore<PricelistResponse>;
  private _timeslots: DataStore<TimeslotsResponse>;

  constructor(private api: BookingApiMock) { }

  /**
   * Begin new appointment booking process. Called by "Book Appointment" button.
   * @param stylistUuid the uuid of the stylist with whom to start booking.
   */
  start(stylistUuid: string): void {
    this._stylistUuid = stylistUuid;
    // clear previous booking information
    this._selectedServices = undefined;
    this._date = undefined;
    this.selectedTime = undefined;
    this._pricelist = undefined;
    this._timeslots = undefined;
  }

  /**
   * Set the list of selected services for the new appointment. Called when the user chooses services.
   */
  setSelectedServices(services: ServiceModel[]): void {
    if (!this._pricelist || !sameServices(this._selectedServices, services)) {
      // remember the list of services
      this._selectedServices = services;

      // create an API-backed cached pricelist
      this._pricelist = new DataStore('booking_pricelist',
        () => this.api.getPricelist(this._stylistUuid, this._selectedServices),
        { cacheTtlMilliseconds: 1000 * 60 }); // TTL for pricelist cache is 1 min
    }
  }

  /**
   * Set the date of appointment. Called when user chooses date in the UI.
   */
  setDate(date: Date): void {
    if (!this._timeslots || this._date !== date) {
      this._date = date;

      // create an API-backed cached timeslots
      this._timeslots = new DataStore('booking_timeslots',
        () => this.api.getTimeslots(this._stylistUuid, date),
        { cacheTtlMilliseconds: 1000 * 60 }); // TTL for timeslots cache is 1 min
    }
  }

  setTotalClientPrice(price: number): void {
    this._totalClientPrice = price;
  }

  get totalClientPrice(): number {
    return this._totalClientPrice;
  }

  get date(): Date {
    return this._date;
  }

  get selectedServices(): ServiceModel[] {
    return this._selectedServices;
  }

  get pricelist(): DataStore<PricelistResponse> {
    return this._pricelist;
  }

  get timeslots(): DataStore<TimeslotsResponse> {
    return this._timeslots;
  }
}
