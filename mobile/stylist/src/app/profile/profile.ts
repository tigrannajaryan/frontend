import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController } from 'ionic-angular';

import { PageNames } from '~/shared/page-names';
import { StylistServiceProvider } from '~/shared/stylist-service/stylist-service';

import { TableData } from '~/shared/components/bb-table/bb-table';
import { StylistProfile } from '~/shared/stylist-service/stylist-models';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfileComponent {
  profile: StylistProfile;
  services: TableData;
  worktime: TableData;
  allServicesCount: number;
  worktingDaysCount: number;

  constructor(
    private navCtrl: NavController,
    private stylistService: StylistServiceProvider,
    private loadingCtrl: LoadingController
  ) {
  }

  async ionViewWillLoad() {
    const data = await this.stylistService.getStylistSummary();

    this.profile = data.profile;
    this.profile.profile_photo_url = `url(${this.profile.profile_photo_url})`;

    this.services = {
      header: ['Service', 'Today price', 'Regular price'],
      body: data.services.services.map(({name, regular_price, today_price}) => [name, `$ ${today_price}`, `$ ${regular_price}`])
    };
    this.allServicesCount = data.services.count;

    this.worktime = {
      header: ['Day', 'Working hours', 'Slots available'],
      body: data.worktime.map(({day, working_hours, slots}) => [day, working_hours, slots])
    };
    this.worktingDaysCount = data.worktime.length;
  }
}
