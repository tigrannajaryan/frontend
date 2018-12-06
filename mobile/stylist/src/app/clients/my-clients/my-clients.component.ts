import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { composeRequest, loading, withRefresher } from '~/shared/utils/request-utils';

import { ApiResponse } from '~/shared/api/base.models';
import { ClientModel, GetMyClientsResponse } from '~/core/api/clients-api.models';
import { MyClientsDataStore } from '~/clients/my-clients/my-clients.data';

import { PageNames } from '~/core/page-names';
import { InvitationsComponentParams } from '~/invitations/invitations.component';

export interface MyClientsComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'page-my-clients',
  templateUrl: 'my-clients.component.html'
})
export class MyClientsComponent {
  @ViewChild(Refresher) refresher: Refresher;

  clients: Observable<ClientModel[]>;
  isLoading: boolean;
  params: MyClientsComponentParams;

  constructor(
    public navParams: NavParams,
    private clientsData: MyClientsDataStore,
    private navCtrl: NavController
  ) {
  }

  ionViewWillLoad(): Promise<ApiResponse<GetMyClientsResponse>> {
    this.params = this.navParams.get('params') as MyClientsComponentParams;

    this.clients = this.clientsData.asObservable().map(({ response }) => response && response.clients);
    return this.requestClients(false);
  }

  onRefresh(invalidateCache = true): Promise<ApiResponse<GetMyClientsResponse>> {
    return this.requestClients(invalidateCache);
  }

  onInviteClick(): void {
    const params: InvitationsComponentParams = { isRootPage: true };
    this.navCtrl.setRoot(PageNames.Invitations, { params });
  }

  onClientClick(client: ClientModel): void {
    this.navCtrl.push(PageNames.ClientDetails, { client });
  }

  onAllClientsClick(): void {
    this.navCtrl.push(PageNames.AllClients);
  }

  private requestClients(invalidateCache = true): Promise<ApiResponse<GetMyClientsResponse>> {
    return composeRequest(
      loading(isLoading => this.isLoading = isLoading),
      withRefresher(this.refresher),
      this.clientsData.get({ refresh: invalidateCache })
    );
  }
}
