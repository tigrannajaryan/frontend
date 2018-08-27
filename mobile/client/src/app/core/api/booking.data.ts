import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { DataStore } from '~/core/utils/data-store';
import { BookingApi, TimeslotsResponse } from '~/core/api/booking.api';
import { GetPricelistResponse, ServiceModel } from '~/core/api/services.models';
import { StylistModel } from '~/core/api/stylists.models';

/**
 * Singleton that stores current booking process data.
 */
@Injectable()
export class BookingData {
  private static guardInitilization = false;

  selectedTime: moment.Moment;

  private _stylist: StylistModel;
  private _selectedServices: ServiceModel[];
  private _date: moment.Moment;
  private _totalRegularPrice: number;
  private _totalClientPrice: number;
  private _pricelist: DataStore<GetPricelistResponse>;
  private _timeslots: DataStore<TimeslotsResponse>;

  constructor(private api: BookingApi) {
    if (BookingData.guardInitilization) {
      console.error('BookingData initialized twice. Only include it in providers array of DataModule.');
    }
    BookingData.guardInitilization = true;
  }

  /**
   * Begin new appointment booking process. Called by "Book Appointment" button.
   * @param stylist the stylist with whom to start booking.
   */
  start(stylist: StylistModel): void {
    this._stylist = stylist;

    // clear previous booking information
    if (this._pricelist) {
      this._pricelist.clear();
    }
    if (this._timeslots) {
      this._timeslots.clear();
    }

    this._selectedServices = undefined;
    this._totalRegularPrice = undefined;
    this._totalClientPrice = undefined;
    this._date = undefined;
    this.selectedTime = undefined;
    this._pricelist = undefined;
    this._timeslots = undefined;
  }

  deleteService(service: ServiceModel): void {
    const index = this._selectedServices.findIndex(v => v === service);
    if (index >= 0) {
      this._selectedServices.splice(index, 1);
      this.setSelectedServices(this._selectedServices);
    }
  }

  /**
   * Set the list of selected services for the new appointment. Called when the user chooses services.
   */
  setSelectedServices(services: ServiceModel[]): void {
    // remember the list of services
    this._selectedServices = services;

    // Calc total regular price
    this._totalRegularPrice = services.reduce((sum, service) => sum + service.base_price, 0);

    if (this._pricelist) {
      this._pricelist.clear();
    }

    // create an API-backed cached pricelist
    this._pricelist = new DataStore('booking_pricelist',
      options => this.api.getPricelist(this._selectedServices, options),
      { cacheTtlMilliseconds: 1000 * 60 }); // TTL for pricelist cache is 1 min

    // Preload prices (don't show alerts on errors since this is just preloading)
    // We don't want to show alert during preloading if there is an API error.
    // It results in duplicate alerts: one during preloading and another when
    // the view that needs the data tries to access it and another API call
    // is issued (because of error the preloading call fails and no response
    // is cached and thus we issue a second API call correctly which again
    // results in error and in alert). Setting hideGenericAlertOnFieldAndNonFieldErrors=true
    // prevents this double alerts on errors and is the best practice for preloading.
    this._pricelist.get({ refresh: true, requestOptions: { hideGenericAlertOnFieldAndNonFieldErrors: true } });
  }

  /**
   * Set the date of appointment. Called when user chooses date in the UI.
   */
  setDate(date: moment.Moment): void {
    if (!this._timeslots || !date.isSame(this._date)) {
      this._date = date;

      if (this._timeslots) {
        this._timeslots.clear();
      }

      // create an API-backed cached timeslots
      this._timeslots = new DataStore('booking_timeslots',
        () => this.api.getTimeslots(this._stylist.uuid, date),
        { cacheTtlMilliseconds: 1000 * 60 }); // TTL for timeslots cache is 1 min
    }
  }

  setTotalClientPrice(price: number): void {
    this._totalClientPrice = price;
  }

  get stylist(): StylistModel {
    return this._stylist;
  }

  get totalClientPrice(): number {
    return this._totalClientPrice;
  }

  get totalRegularPrice(): number {
    return this._totalRegularPrice;
  }

  get date(): moment.Moment {
    return this._date;
  }

  get selectedServices(): ServiceModel[] {
    return this._selectedServices;
  }

  get pricelist(): DataStore<GetPricelistResponse> {
    return this._pricelist;
  }

  get timeslots(): DataStore<TimeslotsResponse> {
    return this._timeslots;
  }
}
