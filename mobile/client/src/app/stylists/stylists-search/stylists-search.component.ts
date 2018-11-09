import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Events, ModalController, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { RequestState } from '~/shared/api/request.models';
import { StylistModel, StylistsSearchParams } from '~/shared/api/stylists.models';
import { GeolocationService, LatLng } from '~/shared/utils/geolocation.service';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import {
  SearchStylistsAction,
  selectIsMoreStylistsAvailable,
  selectStylists,
  selectStylistsRequestState,
  StylistState
} from '~/core/reducers/stylists.reducer';

import { Tabs } from '~/stylists/my-stylists.component';
import {
  NonBookableSavePopupComponent,
  NonBookableSavePopupParams
} from '~/stylists/non-bookable-save-popup/non-bookable-save-popup.component';
import { BookingData } from '~/core/api/booking.data';

export interface StylistsPageParams {
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

  activeStylist?: StylistModel;

  RequestState = RequestState; // expose to view
  requestState?: Observable<RequestState>;

  isGeolocationInProcess = false;
  isLocationInputFocused = false;

  constructor(
    private bookingData: BookingData,
    private events: Events,
    private geolocationService: GeolocationService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData,
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

  onSetActiveStylist(stylist: StylistModel | undefined): void {
    this.activeStylist = stylist;
  }

  async onShowCalendar(stylist: StylistModel): Promise<void> {
    this.bookingData.start(stylist);

    // We want to show the price calendar of this stylist for the most popular service
    const { response } = await this.bookingData.selectMostPopularService();
    if (response) {
      this.navCtrl.push(PageNames.SelectDate);
    }
  }

  async onContinueWithStylist(stylist: StylistModel): Promise<void> {
    const stylistAlreadyPreferred = await this.preferredStylistsData.hasStylist(stylist);
    if (!stylistAlreadyPreferred) {
      await this.preferredStylistsData.addStylist(stylist);
    }

    if (this.onboarding) {
      // In case of onboarding we just redirect to Home:
      await this.navCtrl.setRoot(PageNames.MainTabs);

    } else if (!stylist.is_profile_bookable) {
      // If stylist is not bookable show a popup:
      this.showNonBookableStylistSavedPopup(stylist);

    } else {
      // Common case for adding a stylist navigates back to my stylists:
      await this.navCtrl.popToRoot();
      this.events.publish(ClientEventTypes.selectStylistTab, Tabs.primeStylists);
    }
  }

  private showNonBookableStylistSavedPopup(stylist: StylistModel): void {
    const params: NonBookableSavePopupParams = { stylist };
    const options = { enableBackdropDismiss: false, cssClass: NonBookableSavePopupComponent.cssClass };
    const popup = this.modalCtrl.create(NonBookableSavePopupComponent, { params }, options);
    popup.present();
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
