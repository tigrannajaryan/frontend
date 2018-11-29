import { AfterViewInit, Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { StylistServicesListResponse } from '~/shared/api/stylist-app.models';
import { StylistServiceProvider } from '~/core/api/stylist.service';

@Component({
  selector: 'change-gap-time',
  templateUrl: 'change-gap-time.component.html'
})
export class ChangeGapTimeComponent implements AfterViewInit {
  stylistServicesRes: StylistServicesListResponse;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public stylistService: StylistServiceProvider,
    private servicesData: StylistServicesDataStore
  ) {
  }

  async ngAfterViewInit(): Promise<void> {
    const { response } = await this.servicesData.get();

    if (response) {
      this.stylistServicesRes = response;
    }
  }

  closePopup(): void {
    this.viewCtrl.dismiss();
  }

  async saveTimeGap(): Promise<void> {
    this.closePopup();

    this.servicesData.setServices(
      this.stylistService.getFlatServiceList(this.stylistServicesRes.categories),
      this.stylistServicesRes.service_time_gap_minutes
    );
  }
}
