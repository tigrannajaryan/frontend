import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PageNames } from '~/core/page-names';

import { RequestState } from '~/core/api/request.models';
import { StylistModel } from '~/core/api/stylists.models';
import {
  SearchStylistsAction,
  selectStylists,
  selectStylistsRequestState,
  StylistState
} from '~/core/reducers/stylists.reducer';

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
    private navCtrl: NavController,
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

  onContinueWithStylist(stylist: StylistModel): void {
    this.navCtrl.push(PageNames.ServicesCategories, { stylistUuid: stylist.uuid });
  }
}
