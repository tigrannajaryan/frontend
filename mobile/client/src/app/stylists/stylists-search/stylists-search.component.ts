import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/debounceTime';

import {
  PreferredStylistModel,
  StylistModel,
  StylistsSearchParams
} from '~/shared/api/stylists.models';
import { loading } from '~/shared/utils/loading';
import { GeolocationService, LatLng } from '~/shared/utils/geolocation.service';
import { StylistProfileParams } from '~/stylists/stylist-profile/stylist-profile.component';

import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { StylistsService } from '~/core/api/stylists.service';
import { PageNames } from '~/core/page-names';

@Component({
  selector: 'page-stylists-search',
  templateUrl: 'stylists-search.component.html'
})
export class StylistSearchComponent {
  static MIN_QUERY_LENGTH = 2;
  static SEARCHING_DELAY = 250;

  PageNames = PageNames;

  query: FormControl = new FormControl('');
  locationQuery: FormControl = new FormControl('');
  coords: LatLng;

  loadingStylists = Array(2).fill(undefined);

  stylists: StylistModel[];
  moreStylistsAvailable = false;
  isLoading = false;

  preferredStylists: PreferredStylistModel[] = [];

  isGeolocationInProcess = false;
  isLocationInputFocused = false;

  constructor(
    private app: App,
    private geolocationService: GeolocationService,
    private preferredStylistsData: PreferredStylistsData,
    private stylistsService: StylistsService
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    // Save preferred stylsits to identify preferred ones in search:
    await this.preferredStylistsData.asObservable().subscribe(async preferredStylistsResponse => {
       if (preferredStylistsResponse.response) {
         this.preferredStylists = preferredStylistsResponse.response.stylists;
       }
    });

    // Ask to provide device location:
    await this.requestGeolocation();

    // Start searching:
    await this.onSearchStylists();

    // watch on valueChanges for search query with debounce
    this.query.valueChanges
      .debounceTime(500)
      .subscribe(() => {
        this.onSearchStylists();
      });
  }

  async onSearchStylists(): Promise<void> {
    const params: StylistsSearchParams = {
      search_like: this.query.value,
      search_location: this.locationQuery.value,
      geolocation: this.coords
    };
    const { response } = await loading(this, this.stylistsService.search(params).get());

    if (response) {
      this.stylists = response.stylists;
      this.moreStylistsAvailable = response.more_results_available;
    }

    // Mark stlylists as preferred.
    // TODO: remove this solution when is_profile_preferred returned from the backend
    this.preferredStylists.map(({ uuid }) => {
      const stylist = this.stylists.find(s => s.uuid === uuid);
      if (stylist) {
        stylist.is_profile_preferred = true;
      }
    });
  }

  setLocationInputFocused(isFocused: boolean): void {
    this.isLocationInputFocused = isFocused;
  }

  openStylistPreview(stylist: PreferredStylistModel): void {
    const params: StylistProfileParams = {
      stylist
    };

    this.app.getRootNav().push(PageNames.StylistProfile, { params });
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
