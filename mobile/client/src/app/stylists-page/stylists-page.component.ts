import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { PageNames } from '~/core/page-names';
import { RequestState } from '~/core/api/request.models';
import { StylistModel } from '~/core/api/stylists.models';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import {
  SearchStylistsAction,
  selectStylists,
  selectStylistsRequestState,
  StylistState
} from '~/core/reducers/stylists.reducer';

import { EventTypes } from '~/core/event-types';
import { TabIndex } from '~/main-tabs/main-tabs.component';

export const MIN_QUERY_LENGTH = 2;

@IonicPage()
@Component({
  selector: 'page-stylists',
  templateUrl: 'stylists-page.component.html'
})
export class StylistsPageComponent {
  query: FormControl = new FormControl('');

  loadingStylists = Array(2).fill(undefined);

  stylists: Observable<StylistModel[]>;
  activeStylist?: StylistModel;

  RequestState = RequestState; // expose to view
  requestState?: Observable<RequestState>;

  constructor(
    private events: Events,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData,
    private store: Store<StylistState>
  ) {
  }

  ionViewWillEnter(): void {
    this.stylists = this.store.select(selectStylists);
    this.requestState = this.store.select(selectStylistsRequestState);

    this.onSearchStylists();
  }

  onSearchStylists(): void {
    const query = this.query.value;

    // TODO: search close to client’s location
    this.store.dispatch(new SearchStylistsAction(query));
  }

  onSetActiveStylist(event: Event, stylist: StylistModel | undefined): void {
    this.activeStylist = stylist;
    event.stopPropagation();
  }

  async onContinueWithStylist(stylist: StylistModel): Promise<void> {
    await this.preferredStylistsData.set(stylist);

    if (this.navCtrl.parent) {
      this.events.publish(EventTypes.selectMainTab, TabIndex.Home);
    } else {
      this.navCtrl.setRoot(PageNames.MainTabs);
    }
  }
}
