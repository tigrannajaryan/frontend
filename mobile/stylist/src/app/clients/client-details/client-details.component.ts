import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ExternalAppService } from '~/shared/utils/external-app-service';

import { ClientDetailsApi } from '~/core/api/client-details.api';
import { ClientDetailsModel, MyClientModel } from '~/core/api/clients-api.models';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'client-details',
  templateUrl: 'client-details.component.html'
})
export class ClientDetailsComponent {
  clientDetails: ClientDetailsModel;
  isLoading = false;

  constructor(
    private clientDetailsApi: ClientDetailsApi,
    private externalAppService: ExternalAppService,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {}

  async ionViewWillLoad(): Promise<void> {
    const client = this.navParams.get('client') as MyClientModel;
    const { response } = await this.clientDetailsApi.getClientDetails(client.uuid).get();
    if (response) {
      this.clientDetails = response;
    }
  }

  onEmailClick(email: string): void {
    this.externalAppService.openMailApp(email);
  }

  onCalendarClick(): void {
    this.navCtrl.push(PageNames.ClientsCalendar, { client: this.clientDetails });
  }
}
