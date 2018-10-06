import { Component, ViewChild } from '@angular/core';
import { Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { composeRequest, loading, withRefresher } from '~/shared/utils/request-utils';

import { ApiResponse } from '~/shared/api/base.models';
import { ClientModel, GetAllClientsResponse } from '~/shared/stylist-api/clients-api.models';
import { AllClientsDataStore } from '~/clients/all-clients/all-clients.data';

@Component({
  selector: 'page-all-clients',
  templateUrl: 'all-clients.component.html'
})
export class AllClientsComponent {
  @ViewChild(Refresher) refresher: Refresher;

  clients: Observable<ClientModel[]>;
  isLoading: boolean;

  constructor(
    private clientsData: AllClientsDataStore
  ) {
  }

  ionViewWillLoad(): Promise<ApiResponse<GetAllClientsResponse>> {
    this.clients = this.clientsData.asObservable().map(({ response }) => response);
    return this.requestClients(false);
  }

  onRefresh(invalidateCache = true): Promise<ApiResponse<GetAllClientsResponse>> {
    return this.requestClients(invalidateCache);
  }

  private requestClients(invalidateCache = true): Promise<ApiResponse<GetAllClientsResponse>> {
    return composeRequest(
      loading(isLoading => this.isLoading = isLoading),
      withRefresher(this.refresher),
      this.clientsData.get({ refresh: invalidateCache })
    );
  }
}
