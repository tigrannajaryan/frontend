import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { RequestState } from '~/shared/api/request.models';
import { StylistModel, StylistsSearchParams } from '~/shared/api/stylists.models';
import { GeolocationService, LatLng } from '~/shared/utils/geolocation.service';

import { PageNames } from '~/core/page-names';
import {
  SearchStylistsAction,
  selectIsMoreStylistsAvailable,
  selectStylists,
  selectStylistsRequestState,
  StylistState
} from '~/core/reducers/stylists.reducer';

import { StylistPageParams, StylistPageType } from '~/stylists/stylist/stylist.component';

interface StylistsPageParams {
  onboarding?: boolean;
}

@Component({
  selector: 'page-stylists-search',
  templateUrl: 'stylists-search.component.html'
})
export class StylistsPageComponent {
  static MIN_QUERY_LENGTH = 2;

  PageNames = PageNames;
  onboarding = false;

  query: FormControl = new FormControl('');
  locationQuery: FormControl = new FormControl('');
  coords: LatLng;

  loadingStylists = Array(2).fill(undefined);

  stylists: Observable<StylistModel[]>;
  moreStylistsAvailable: Observable<boolean>;

  RequestState = RequestState; // expose to view
  requestState?: Observable<RequestState>;

  isGeolocationInProcess = false;
  isLocationInputFocused = false;

  constructor(
    private geolocationService: GeolocationService,
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<StylistState>
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    const params = (this.navParams.get('data') || {}) as StylistsPageParams;

    this.onboarding = params.onboarding;

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

  setLocationInputFocused(isFocused: boolean): void {
    this.isLocationInputFocused = isFocused;
  }

  onContinueWithStylist(stylist: StylistModel): void {
    this.navCtrl.push(PageNames.Stylist, this.getStylistPageParams(stylist));
  }

  /**
   * Returns params for the Stylist’s page.
   * Note: this function is used in tests and therefor declared public
   */
  getStylistPageParams(stylist: StylistModel): { data: StylistPageParams } {
    return {
      data: {
        pageType: StylistPageType.StylistInSearch,
        onboarding: this.onboarding,
        stylist
      }
    };
  }

  private async requestGeolocation(): Promise<void> {
    this.isGeolocationInProcess = true;
    try {
      this.coords = await this.geolocationService.getUserCoordinates();
    } catch {
      // Simply ignore location. It fallbacks to ip-location anyway.
    } finally {
      this.isGeolocationInProcess = false;
    }
  }
}
