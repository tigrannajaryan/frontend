import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { UserRole } from '~/shared/api/auth.models';
import { PushNotification } from '~/shared/push/push-notification';
import { PushPrimingScreenParams } from '~/shared/components/push-priming-screen/push-priming-screen.component';
import { PageNames } from '~/core/page-names';
import { DayOffer, ServiceModel } from '~/shared/api/price.models';
import { StylistProfile } from '~/shared/api/stylist-app.models';
import { ProfileDataStore } from '~/core/profile.data';

export interface CalendarExampleComponentParams {
  isRootPage: boolean;
}

// Some nice looking fake prices
const fakePrices = [
  200, 200, 200, undefined,
  200, 170, 160, 190, 190, 200, undefined,
  190, 185, 160, 190, 200, 200, 200,
  200, 170, undefined, 200, 200, undefined, 200,
  200, 185, 170
];

@Component({
  selector: 'page-calendar-example',
  templateUrl: 'calendar-example.component.html'
})
export class CalendarExampleComponent {
  @ViewChild(Content) content: Content;
  PageNames = PageNames;

  regularPrice = 200;

  // Fake service
  services: ServiceModel[] = [{
    uuid: undefined,
    name: 'Color Correction',
    base_price: this.regularPrice
  }];

  prices: DayOffer[] = [];

  profile: StylistProfile;
  params: CalendarExampleComponentParams;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private profileData: ProfileDataStore,
    private pushNotification: PushNotification
  ) {
    // Generate offers starting from today using fake prices
    for (let i = 0; i < fakePrices.length; i++) {
      this.prices.push({
        date: moment().add(i, 'days').format('YYYY-MM-DD'),
        price: fakePrices[i],
        is_fully_booked: fakePrices[i] === undefined,
        is_working_day: fakePrices[i] !== undefined
      });
    }
  }

  async ionViewWillLoad(): Promise<void> {
    this.params = this.navParams.get('params') as CalendarExampleComponentParams;

    const { response } = await this.profileData.get();
    if (!response) {
      return;
    }

    this.profile = response;
  }

  /**
   * Shows PageNames.RegistrationDone immediatly or after PushPrimingScreen.
   */
  async onContinue(): Promise<void> {
    if (await this.pushNotification.needToShowPermissionScreen()) {
      const pushParams: PushPrimingScreenParams = {
        appType: UserRole.stylist,
        onContinue: async () => {
          // Show registration done screen after push priming
          this.navCtrl.push(PageNames.RegistrationDone);
        }
      };
      this.navCtrl.push(PageNames.PushPrimingScreen, { params: pushParams });
    } else {
      this.navCtrl.push(PageNames.RegistrationDone);
    }
  }

  onDeleteService(): void {
    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
  }
}
