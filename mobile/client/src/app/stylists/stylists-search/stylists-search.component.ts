import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Events, ModalController, NavController } from 'ionic-angular';

import {
  PreferredStylistModel,
  StylistModel,
  StylistsSearchParams,
  StylistUuidModel
} from '~/shared/api/stylists.models';
import { loading } from '~/shared/utils/loading';
import { GeolocationService, LatLng } from '~/shared/utils/geolocation.service';

import { BookingData } from '~/core/api/booking.data';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { StylistsService } from '~/core/api/stylists.service';
import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';

import { MyStylistsTabs } from '~/stylists/my-stylists.component';
import {
  NonBookableSavePopupComponent,
  NonBookableSavePopupParams
} from '~/stylists/non-bookable-save-popup/non-bookable-save-popup.component';

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

  activeStylist?: StylistModel;

  isGeolocationInProcess = false;
  isLocationInputFocused = false;

  constructor(
    private bookingData: BookingData,
    private events: Events,
    private geolocationService: GeolocationService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData,
    private stylistsService: StylistsService
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    // Save preferred stylsits to identify preferred ones in search:
    this.preferredStylists = await this.preferredStylistsData.get();

    // Ask to provide device location:
    await this.requestGeolocation();

    // Start searching:
    await this.onSearchStylists();
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
    const preferredStylist = this.getPreferredStylist(stylist);

    stylist.is_profile_preferred = true;

    if (!preferredStylist) {
      const { response } = await this.preferredStylistsData.addStylist(stylist);

      if (response) {
        await this.updatePreferredStylists();
      } else { // roll back
        stylist.is_profile_preferred = false;
      }
    }

    if (!stylist.is_profile_bookable) {
      // If stylist is not bookable show a popup:
      this.showNonBookableStylistSavedPopup(stylist);

    } else {
      // Common case for adding a stylist navigates back to my stylists:
      await this.navCtrl.popToRoot();
      this.events.publish(ClientEventTypes.selectStylistTab, MyStylistsTabs.madeStylists);
    }
  }

  async onRemoveStylist(stylist: PreferredStylistModel): Promise<void> {
    const preferredStylist = this.getPreferredStylist(stylist);
    if (!preferredStylist) {
      return;
    }

    stylist.is_profile_preferred = false;

    const isRemoved = await this.preferredStylistsData.removeStylist(preferredStylist.preference_uuid);
    if (!isRemoved) { // roll back
      stylist.is_profile_preferred = true;
    }

    await this.updatePreferredStylists();
  }

  private getPreferredStylist(stylist: StylistModel): PreferredStylistModel {
    return this.preferredStylists.find((preferred: StylistUuidModel) => preferred.uuid === stylist.uuid);
  }

  private async updatePreferredStylists(): Promise<void> {
    this.preferredStylists = await this.preferredStylistsData.get();
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
