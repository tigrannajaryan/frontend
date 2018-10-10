import { Injectable, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { DayOffer, ServiceModel } from '~/shared/api/price.models';
import { StylistModel } from '~/shared/api/stylists.models';
import { DataStore } from '~/shared/storage/data-store';
import { BookingApi, TimeslotsResponse } from '~/core/api/booking.api';
import { GetPricelistResponse } from '~/core/api/services.models';

interface DayOfferWithTotalRegularPrice extends DayOffer {
  totalRegularPrice: number;
}

/**
 * Singleton that stores current booking process data.
 */
@Injectable()
export class BookingData implements OnDestroy {
  private static guardInitilization = false;

  selectedTime: moment.Moment;

  private _stylist: StylistModel;
  private _selectedServices: ServiceModel[];
  private _date: moment.Moment;
  private _offer: DayOfferWithTotalRegularPrice;
  private _pricelist: DataStore<GetPricelistResponse>;
  private _timeslots: DataStore<TimeslotsResponse>;

  private servicesSubject: BehaviorSubject<ServiceModel[]>;
  private servicesSubscription: Subscription;

  constructor(private api: BookingApi) {
    if (BookingData.guardInitilization) {
      console.error('BookingData initialized twice. Only include it in providers array of DataModule.');
    }
    BookingData.guardInitilization = true;

    this.servicesSubject = new BehaviorSubject<ServiceModel[]>([]);

    // Recalculate offer's price on services change:
    this.servicesSubscription = this.selectedServicesObservable.subscribe(async () => {
      if (this._pricelist && this._offer) {
        const { response } = await this.pricelist.get();
        const newOffer = response && response.prices.find(offer => this._offer && offer.date === this._offer.date);
        if (newOffer) {
          this.setOffer(newOffer);
        } else {
          // This can happen in an edge case when the date becomes no longer available for booking if e.g.
          // - ist‘s too late for this date
          // - or when there is no free timeslot.
          this.setOffer(undefined);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.servicesSubscription.unsubscribe();
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
    this._offer = undefined;
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
      this.onServicesChange();
    }
  }

  /**
   * Set the list of selected services for the new appointment. Called when the user chooses services.
   */
  setSelectedServices(services: ServiceModel[]): void {
    // remember the list of services
    this._selectedServices = services;
    this.onServicesChange();

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

  hasSelectedService(service: ServiceModel): boolean {
    return Boolean(this._selectedServices) && this._selectedServices.some(selectedService => selectedService.uuid === service.uuid);
  }

  setOffer(offer: DayOffer): void {
    if (offer === undefined) {
      this._offer = undefined;
      this._timeslots = undefined;
      return;
    }

    const date = moment(offer.date);

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

    this._offer = {
      ...offer,
      totalRegularPrice: this._selectedServices.reduce((sum, service) => sum + service.base_price, 0)
    };
  }

  get stylist(): StylistModel {
    return this._stylist;
  }

  get offer(): DayOfferWithTotalRegularPrice {
    return this._offer;
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

  get selectedServicesObservable(): Observable<ServiceModel[]> {
    return this.servicesSubject.asObservable();
  }

  private onServicesChange(): void {
    // Tell subscribers to update services:
    this.servicesSubject.next(this._selectedServices);
  }
}
