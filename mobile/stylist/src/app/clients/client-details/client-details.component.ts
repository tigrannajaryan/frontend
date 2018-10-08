import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { ExternalAppService } from '~/shared/utils/external-app-service';

import { ClientDetailsApi } from '~/shared/stylist-api/client-details.api';
import { MyClientModel } from '~/shared/stylist-api/clients-api.models';
import { ClientDetailsModel } from '~/shared/stylist-api/client-details.models';

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
}