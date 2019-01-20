import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { App, Content, Header, Keyboard, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
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

enum ScrollDirection {
  Up = 'up',
  Down = 'down'
}

interface IonicScrollEvent { // not defined in Ionic
  deltaY: number;
  directionY: string;
  scrollTop: number;

  domWrite(handler: () => void): void;
}

export interface StylistSearchParams {
  isRootPage: boolean;
}

@Component({
  selector: 'page-stylists-search',
  templateUrl: 'stylists-search.component.html'
})
export class StylistSearchComponent implements AfterViewInit {
  static MIN_QUERY_LENGTH = 2;
  static SEARCHING_DELAY = 250;

  static MIN_SCROLL_DELTA = 100;
  static MIN_SCROLL_TOP_TRIGGER_SIZE = 300;

  PageNames = PageNames;

  query: FormControl = new FormControl('');
  locationQuery: FormControl = new FormControl('');
  coords: LatLng;

  loadingStylists = Array(2).fill(undefined);

  stylists: StylistModel[];
  moreStylistsAvailable = false;
  isLoading = false;

  isBackBtnDisabled = false;

  preferredStylists: PreferredStylistModel[] = [];

  isGeolocationInProcess = false;
  isLocationInputFocused = false;

  @ViewChild(Content) content: Content;
  @ViewChild(Header) header: Header;

  private onScrollSubscription: Subscription;

  constructor(
    private app: App,
    private geolocationService: GeolocationService,
    private keyboard: Keyboard,
    private params: NavParams,
    private preferredStylistsData: PreferredStylistsData,
    private stylistsService: StylistsService
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    const params = (this.params.get('params') || {}) as StylistSearchParams;
    this.isBackBtnDisabled = Boolean(params.isRootPage);

    // Show keyboard hide btn
    this.keyboard.hideFormAccessoryBar(false);

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

  ngAfterViewInit(): void {
    if (!this.onScrollSubscription) {
      this.onScrollSubscription =
        this.content.ionScroll
          .subscribe(event => this.resizeHeader(event));
    }
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

  async scrollTop(): Promise<void> {
    await this.content.scrollTo(0, 0, 400);
    this.showHeader();
  }

  showHeader(): void {
    this.header._elementRef.nativeElement.classList.remove('is-Minified');
    this.content._elementRef.nativeElement.classList.remove('is-Minified');
    this.content.resize();
  }

  hideHeader(): void {
    if (this.keyboard.isOpen()) {
      // Ionic has a bug in content resizing on iOS:
      // if resizing is triggered when scroll in progress the content is going to be resized
      // only when resizing is done (innertive scrolling stops).
      // We need to blur activeElement on scroll but we cannot do it because of the bug.
      // To fix it we can only disallow hiding header when an input is focused and keyboard is open.
      return;
    }
    this.header._elementRef.nativeElement.classList.add('is-Minified');
    this.content._elementRef.nativeElement.classList.add('is-Minified');
    this.content.resize();
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

  private resizeHeader(event: IonicScrollEvent): void {
    event.domWrite(() => {
      const { deltaY, directionY, scrollTop } = event;

      const contentPageHeight =
        this.content._elementRef.nativeElement.querySelector('.fixed-content').offsetHeight;
      const stylistsCardsHeight =
        this.content._elementRef.nativeElement.querySelector('.StylistsPage-stylists').offsetHeight;

      if (stylistsCardsHeight < contentPageHeight + StylistSearchComponent.MIN_SCROLL_TOP_TRIGGER_SIZE) {
        // No room for any minification work
        return;
      }

      switch (directionY) {
        case ScrollDirection.Down:
          if (scrollTop < 0) {
            this.showHeader();
            return;
          }
          if (deltaY < StylistSearchComponent.MIN_SCROLL_DELTA) {
            // Skip small delta
            return;
          }
          this.hideHeader();
          break;

        case ScrollDirection.Up:
          if (
            scrollTop > StylistSearchComponent.MIN_SCROLL_TOP_TRIGGER_SIZE ||
            deltaY < StylistSearchComponent.MIN_SCROLL_DELTA
          ) {
            // Skip scrolled lots of results or small delta
            return;
          }
          this.showHeader();
          break;

        default:
          break;
      }
    });
  }
}
