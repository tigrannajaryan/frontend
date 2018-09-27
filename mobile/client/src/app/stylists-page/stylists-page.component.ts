import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, Tab } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { PageNames } from '~/core/page-names';
import { RequestState } from '~/shared/api/request.models';
import { StylistModel } from '~/shared/api/stylists.models';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
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
  continueText?: string; // nav param

  query: FormControl = new FormControl('');

  loadingStylists = Array(2).fill(undefined);

  stylists: Observable<StylistModel[]>;
  activeStylist?: StylistModel;

  RequestState = RequestState; // expose to view
  requestState?: Observable<RequestState>;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData,
    private store: Store<StylistState>
  ) {
  }

  ionViewWillEnter(): void {
    this.continueText = this.navParams.get('continueText');

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

    // Pop back if it‘s a MainTab nav (when not in onboarding flow):
    if (this.navCtrl.parent && this.navCtrl instanceof Tab) {
      this.navCtrl.pop();
    } else {
      this.navCtrl.setRoot(PageNames.MainTabs);
    }

    this.activeStylist = undefined;
  }
}
