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

    this.searchStylists();
  }

  searchStylists(): void {
    const query = this.query.value;

    // TODO: search close to client’s location
    this.store.dispatch(new SearchStylistsAction(query));
  }

  setActiveStylist(event: Event, stylist: StylistModel | undefined): void {
    this.activeStylist = stylist;
    event.stopPropagation();
  }

  continueWithStylist(stylist: StylistModel): void {
    // TODO: uncomment after adding services pages
    // this.navCtrl.push(PageNames.Categories, { stylistUuid: stylist.uuid });
  }
}
