import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams, Tab } from 'ionic-angular';
import { Coordinates } from '@ionic-native/geolocation';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { RequestState } from '~/shared/api/request.models';
import { StylistModel, StylistsSearchParams } from '~/shared/api/stylists.models';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { GeolocationService } from '~/shared/utils/geolocation.service';

import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { PageNames } from '~/core/page-names';
import {
  SearchStylistsAction,
  selectStylists,
  selectStylistsRequestState,
  StylistState
} from '~/core/reducers/stylists.reducer';

export const MIN_QUERY_LENGTH = 2;

@Component({
  selector: 'page-stylists',
  templateUrl: 'stylists-page.component.html'
})
export class StylistsPageComponent {
  continueText?: string; // nav param

  query: FormControl = new FormControl('');
  locationQuery: FormControl = new FormControl('');
  coords: Coordinates;

  loadingStylists = Array(2).fill(undefined);

  stylists: Observable<StylistModel[]>;
  activeStylist?: StylistModel;

  RequestState = RequestState; // expose to view
  requestState?: Observable<RequestState>;

  constructor(
    private externalAppService: ExternalAppService,
    private geolocationService: GeolocationService,
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

  async ionViewDidLoad(): Promise<void> {
    this.coords = await this.geolocationService.getUserCoordinates();

    if (this.coords) {
      this.onSearchStylists();
    }
  }

  onSearchStylists(): void {
    const params: StylistsSearchParams = {
      search_like: this.query.value,
      search_location: this.locationQuery.value,
      latitude: this.coords && this.coords.latitude,
      longitude: this.coords && this.coords.longitude
    };
    this.store.dispatch(new SearchStylistsAction(params));
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

  onInstagramClick(username: string): void {
    this.externalAppService.openInstagram(username);
  }

  onWebsiteClick(url: string): void {
    this.externalAppService.openWebPage(url);
  }
}
