import { Component, ViewChild } from '@angular/core';
import { AlertController, Content, Events, NavController } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { loading } from '~/shared/utils/loading';
import { DayOffer } from '~/shared/api/price.models';
import { componentIsActive } from '~/shared/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';
import { ClientEventTypes } from '~/core/client-event-types';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { confirmMakeStylistPreferred } from '../booking-utils';
import { PreferredStylistModel } from '~/shared/api/stylists.models';
import { isoDateFormat } from '~/shared/api/base.models';
import { BookServicesHeaderComponent } from '../book-services-header/book-services-header';
import { ServiceItem } from '~/shared/api/stylist-app.models';
import { PricingHints } from '~/shared/components/services-header-list/services-header-list';

@Component({
  selector: 'select-date',
  templateUrl: 'select-date.component.html'
})
export class SelectDateComponent {
  @ViewChild(Content) content: Content;
  @ViewChild(BookServicesHeaderComponent) servicesHeader: BookServicesHeaderComponent;

  regularPrice: number;
  hints: PricingHints[];
  isLoading: boolean;
  prices: DayOffer[];
  preferredStylists: Promise<PreferredStylistModel[]>;

  static getRegularPrice(services: ServiceItem[]): number {
    return services.reduce((price, service) => price + service.base_price, 0);
  }

  constructor(
    protected bookingData: BookingData,
    private alertCtrl: AlertController,
    private events: Events,
    private logger: Logger,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('SelectDateComponent.ionViewWillEnter');

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

          // When empty offers or all days of preferred stylist either booked or set to non-working:
          const notTimeslots =
            response.prices.length === 0 ||
            response.prices.every(offer => offer.is_fully_booked || !offer.is_working_day);

          if (notTimeslots) {
            this.showNoTimeSlotsPopup();
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
    this.navCtrl.push(PageNames.SelectTime);
  }

  onServiceChange(): void {
    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
  }

  private showNoTimeSlotsPopup(): void {
    const popup = this.alertCtrl.create({
      cssClass: 'SelectDate-notAvailablePopup',
      title: 'No time slots',
      subTitle: '🤦‍♀️',
      message: 'Unfortunately, your stylist does not have any open slots right now.',
      buttons: [{
        text: 'Show available stylists',
        role: 'cancel',
        handler: () => {
          setTimeout(async () => {
            await this.navCtrl.setRoot(PageNames.MainTabs);
            this.events.publish(ClientEventTypes.startBooking);
          });
        }
      }]
    });
    popup.present();
  }
}
