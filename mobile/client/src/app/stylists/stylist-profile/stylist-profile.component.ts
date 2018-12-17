import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, Content, Events, NavController, NavParams } from 'ionic-angular';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { formatNumber } from 'libphonenumber-js';

import { StylistProfileApi } from '~/shared/api/stylist-profile.api';
import { UserRole } from '~/shared/api/auth.models';
import {
  PreferredStylistModel,
  StylistProfileRequestParams,
  StylistProfileResponse
} from '~/shared/api/stylists.models';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { NumberFormat } from '~/shared/directives/phone-input.directive';
import { DayOffer, ServiceModel } from '~/shared/api/price.models';

import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { ClientEventTypes } from '~/core/client-event-types';

export enum UpdateStylistStatus {
  save,
  remove
}

export interface StylistProfileParams {
  stylist: PreferredStylistModel;
}

@Component({
  selector: 'stylist-profile',
  templateUrl: 'stylist-profile.component.html'
})
export class StylistProfileComponent {
  @ViewChild(Content) content: Content;
  UpdateStylistStatus = UpdateStylistStatus;
  params: StylistProfileParams;
  prices: DayOffer[];
  service: ServiceModel;
  stylistProfile: StylistProfileResponse;

  constructor(
    private events: Events,
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData,
    private launchNavigator: LaunchNavigator,
    private externalAppService: ExternalAppService,
    private actionSheetCtrl: ActionSheetController,
    private bookingData: BookingData,
    private stylistProfileApi: StylistProfileApi
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.params = this.navParams.get('params') as StylistProfileParams;

    if (this.params && this.params.stylist) {
      const params: StylistProfileRequestParams = {
        role: UserRole.client,
        stylistUuid: this.params.stylist.uuid
      };

      const { response } = await this.stylistProfileApi.getStylistProfile(params).toPromise();

      if (response) {
        this.stylistProfile = response;
      }
    }

    this.getPrice();
  }

  async getPrice(): Promise<void> {
    if (!(this.stylistProfile && this.stylistProfile.is_profile_bookable)) {
      return;
    }

    this.bookingData.start(this.params.stylist);

    // We want to show the price calendar of this stylist for the most popular service
    const { response } = await this.bookingData.selectMostPopularService();
    if (response) {
      this.prices = response.prices;
    }

    const services = await this.bookingData.selectedServicesObservable.get();
    if (services.length > 0) {
      this.service = services[0];
    }

    if (this.content) {
      // need to update scrollable area when calendar appear
      this.content.resize();
    }
  }

  async onShowCalendar(): Promise<void> {
    if (this.prices) {
      // clear services - we should show calendar without services
      this.bookingData.setSelectedServices([]);
      this.navCtrl.push(PageNames.SelectDate);
    }
  }

  async onRemoveStylist(): Promise<void> {
    if (!(this.params && this.stylistProfile)) {
      return;
    }

    const isRemoved = await this.preferredStylistsData.removeStylist(this.stylistProfile.preference_uuid);
    this.stylistProfile.is_preferred = !isRemoved;

    await this.preferredStylistsData.get();
  }

  async onSaveStylist(): Promise<void> {
    this.stylistProfile.is_preferred = true;

    const { error } = await this.preferredStylistsData.addStylist(this.stylistProfile);

    if (error) {
      this.stylistProfile.is_preferred = false;
    }

    await this.preferredStylistsData.get();
  }

  onFollowersClick(): void {
    this.navCtrl.push(PageNames.Followers, { stylist: this.stylistProfile });
  }

  onAddressClick(): void {
    this.externalAppService.openAddress(this.launchNavigator, this.stylistProfile.salon_address);
  }

  onInstagramClick(): void {
    this.externalAppService.openInstagram(this.stylistProfile.instagram_url);
  }

  onWebsiteClick(): void {
    this.externalAppService.openWebPage(this.stylistProfile.website_url);
  }

  onStartBooking(): void {
    if (!(this.params && this.stylistProfile && this.stylistProfile.is_profile_bookable)) {
      return;
    }

    if (!this.stylistProfile.is_preferred) {
      this.onSaveStylist();
    }

    this.events.publish(ClientEventTypes.startBooking, this.stylistProfile.uuid);
  }

  onPhoneClick(): void {
    if (this.stylistProfile && this.stylistProfile.phone) {
      const buttons = [
        {
          text: `Copy ${formatNumber(this.stylistProfile.phone, NumberFormat.International)}`,
          handler: () => {
            this.externalAppService.copyToTheClipboard(this.stylistProfile.phone);
          }
        },
        {
          text: `Dial ${formatNumber(this.stylistProfile.phone, NumberFormat.International)}`,
          handler: () => {
            this.externalAppService.doPhoneCall(this.stylistProfile.phone);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ];

      const actionSheet = this.actionSheetCtrl.create({ buttons });
      actionSheet.present();
    }
  }

  onEmailClick(): void {
    this.externalAppService.openMailApp(this.stylistProfile.email);
  }

  onCall(): void {
    this.externalAppService.doPhoneCall(this.stylistProfile.phone);
  }
}
