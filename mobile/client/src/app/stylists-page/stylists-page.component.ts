import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams, Tab } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { RequestState } from '~/shared/api/request.models';
import { StylistModel, StylistsSearchParams } from '~/shared/api/stylists.models';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { GeolocationService, LatLng } from '~/shared/utils/geolocation.service';

import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { PageNames } from '~/core/page-names';
import {
  SearchStylistsAction,
  selectIsMoreStylistsAvailable,
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
  coords: LatLng;

  loadingStylists = Array(2).fill(undefined);

  stylists: Observable<StylistModel[]>;
  moreStylistsAvailable: Observable<boolean>;
  activeStylist?: StylistModel;

  RequestState = RequestState; // expose to view
  requestState?: Observable<RequestState>;

  isGeolocationInProcess = false;
  isLocationInputFocused = false;

  constructor(
    private externalAppService: ExternalAppService,
    private geolocationService: GeolocationService,
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData,
    private store: Store<StylistState>
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.continueText = this.navParams.get('continueText');

    this.stylists = this.store.select(selectStylists);
    this.moreStylistsAvailable = this.store.select(selectIsMoreStylistsAvailable);
    this.requestState = this.store.select(selectStylistsRequestState);

    await this.requestGeolocation();

    this.onSearchStylists();
  }

  onSearchStylists(): void {
    const params: StylistsSearchParams = {
      search_like: this.query.value,
      search_location: this.locationQuery.value,
      geolocation: this.coords
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

  setLocationInputFocused(isFocused: boolean): void {
    this.isLocationInputFocused = isFocused;
  }

  private async requestGeolocation(): Promise<void> {
    this.isGeolocationInProcess = true;
    this.coords = await this.geolocationService.getUserCoordinates();
    this.isGeolocationInProcess = false;
  }
}
