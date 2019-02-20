import { Component, ViewChild } from '@angular/core';
import { Content, Events, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { loading } from '~/shared/utils/loading';
import { DayOffer } from '~/shared/api/price.models';
import { componentIsActive } from '~/shared/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';
import { ClientEventTypes } from '~/core/client-event-types';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import {
  checkStylistAvailability,
  confirmMakeStylistPreferred,
  hasMoreAvailableStylists,
  showNoTimeSlotsPopup
} from '../booking-utils';
import { PreferredStylistModel } from '~/shared/api/stylists.models';
import { isoDateFormat } from '~/shared/api/base.models';
import { BookServicesHeaderComponent } from '../book-services-header/book-services-header';
import { ServiceItem } from '~/shared/api/stylist-app.models';
import { PricingHint } from '~/shared/components/services-header-list/services-header-list';
import { MainTabIndex } from '~/main-tabs/main-tabs.component';
import { SelectTimeComponentParams } from '~/booking/select-time/select-time.component';

export interface SelectDateComponentParams {
  isRescheduling?: boolean;
}

@Component({
  selector: 'select-date',
  templateUrl: 'select-date.component.html'
})
export class SelectDateComponent {
  @ViewChild(Content) content: Content;
  @ViewChild(BookServicesHeaderComponent) servicesHeader: BookServicesHeaderComponent;

  params: SelectDateComponentParams;
  regularPrice: number;
  hints: PricingHint[];
  isLoading: boolean;
  prices: DayOffer[];
  preferredStylists: Promise<PreferredStylistModel[]>;

  static getRegularPrice(services: ServiceItem[]): number {
    return services.reduce((price, service) => price + service.base_price, 0);
  }

  constructor(
    protected bookingData: BookingData,
    private events: Events,
    private logger: Logger,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData,
    private navParams: NavParams
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('SelectDateComponent.ionViewWillEnter');

    this.params = this.navParams.get('params') as SelectDateComponentParams;

    this.bookingData.selectedServicesObservable
      .takeWhile(componentIsActive(this))
      .subscribe(async (services: ServiceItem[]) => {
        if (!this.bookingData.pricelist || !this.bookingData.selectedServices ||
          this.bookingData.selectedServices.length === 0) {
          // No services selected. Don't show prices
          this.prices = [{
            date: moment().format(isoDateFormat),
            price: undefined,
            is_fully_booked: false,
            is_working_day: false
          }];
          return;
        }

        if (services) {
          this.regularPrice = SelectDateComponent.getRegularPrice(services);
        }

        const { response } = await loading(this, this.bookingData.pricelist.get());
        if (response) {
          this.prices = response.prices;
          this.hints = response.pricing_hints;
          // update header after adding hint
          this.onServiceChange();

          if (await checkStylistAvailability()) {
            showNoTimeSlotsPopup([{
              text: await hasMoreAvailableStylists() ? 'Show available stylists' : 'Search for available stylists',
              cssClass: 'notAvailablePopup-btn',
              role: 'cancel',
              handler: () => {
                setTimeout(async () => {
                  await this.navCtrl.setRoot(PageNames.MainTabs);

                  // Start booking and show stylists selector if more than 1 stylist remains.
                  if (await hasMoreAvailableStylists()) {
                    this.events.publish(ClientEventTypes.startBooking);
                  } else {
                    this.events.publish(ClientEventTypes.selectMainTab, MainTabIndex.StylistSearch);
                  }
                });
              }
            }]);
          }
        }
      });

    // Start getting preferredStylists list
    this.preferredStylists = this.preferredStylistsData.get();
  }

  onAddService(): void {
    this.servicesHeader.onAdd();
  }

  async onSelectOffer(offer: DayOffer): Promise<void> {
    this.logger.info('onSelectOffer', offer);

    // Check that selected stylist is preferred
    const preferredStylists = await this.preferredStylists;
    const stylistIsPreferred = preferredStylists && preferredStylists.some(preferred => preferred.uuid === this.bookingData.stylist.uuid);
    if (!stylistIsPreferred) {
      // Not preferred, so ask to make them preferred
      const confirmed = await confirmMakeStylistPreferred(this.bookingData.stylist.first_name, this.bookingData.stylist.uuid);
      if (!confirmed) {
        return;
      }
    }

    this.bookingData.setOffer(offer);

    const params: SelectTimeComponentParams = {
      isRescheduling: this.params && this.params.isRescheduling
    };
    this.navCtrl.push(PageNames.SelectTime, { params });
  }

  onServiceChange(): void {
    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
  }
}
