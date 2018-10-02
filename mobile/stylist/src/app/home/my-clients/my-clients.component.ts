import { Component, ViewChild } from '@angular/core';
import { Events, IonicPage, NavController, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { composeRequest, loading, withRefresher } from '~/shared/utils/request-utils';

import { ClientModel } from '~/shared/stylist-api/clients-api.models';
import { ClientsDataStore } from '~/home/my-clients/clients.data';

import { EventTypes } from '~/core/event-types';
import { TabIndex } from '~/tabs/tabs.component';

@IonicPage()
@Component({
  selector: 'page-my-clients',
  templateUrl: 'my-clients.component.html'
})
export class MyClientsComponent {
  Array = Array;

  @ViewChild(Refresher) refresher: Refresher;

  clients: Observable<ClientModel[]>;
  isLoading: boolean;

  constructor(
    private clientsData: ClientsDataStore,
    private events: Events,
    private navCtrl: NavController
  ) {
  }

  ionViewWillLoad(): void {
    this.clients = this.clientsData.asObservable().map(({ response }) => response && response.clients);
    this.requestClients(false);
  }

  onRefresh(): void {
    this.requestClients();
  }

  onInviteClick(): void {
    this.navCtrl.popToRoot();
    this.events.publish(EventTypes.selectMainTab, TabIndex.Invite);
  }

  private requestClients(invalidateCache = true): void {
    composeRequest(
      loading(isLoading => this.isLoading = isLoading),
      withRefresher(this.refresher),
      this.clientsData.get({ refresh: invalidateCache })
    );
  }
}
