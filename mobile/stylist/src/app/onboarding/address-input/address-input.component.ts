import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';

import { MapsAPILoader } from '@agm/core';
import Autocomplete = google.maps.places.Autocomplete;

import { Logger } from '~/shared/logger';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';

import { RegistrationForm } from '~/onboarding/registration.form';

export interface AddressInputComponentParams {
  isRootPage?: boolean;
}

declare var window: any;

@Component({
  selector: 'address-input',
  templateUrl: 'address-input.component.html'
})
export class AddressInputComponent implements AfterViewInit, OnInit {
  params: AddressInputComponentParams;

  address: FormControl;

  autocomplete: Autocomplete;
  autocompleteInput: HTMLInputElement;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private logger: Logger,
    private mapsAPILoader: MapsAPILoader,
    private navCtrl: NavController,
    private navParams: NavParams,
    private ngZone: NgZone,
    private registrationForm: RegistrationForm,
    private stylistApi: StylistServiceProvider
  ) {
  }

  ngOnInit(): void {
    this.params = this.navParams.get('params') || {};

    const { salon_address } = this.registrationForm.getFormControls();

    this.address = salon_address;
  }

  async ngAfterViewInit(): Promise<void> {
    // Ensure google map’s key is set up:
    await this.stylistApi.loadGoogleMapsApiKey().toPromise();

    this.initAutocomplete();
  }

  isValid(): boolean {
    return this.address.valid;
  }

  onNavigateNext(): void {
    if (!this.params.isRootPage) {
      this.navCtrl.push(PageNames.ConnectInstagram);
    } else {
      this.navCtrl.popToRoot();
    }
  }

  @loading
  async onContinue(): Promise<void> {
    if (this.address.valid) {
      await this.registrationForm.save();

      this.onNavigateNext();
    }
  }

  private initAutocomplete(): void {
    const pacContainers = document.getElementsByClassName('pac-container');
    while (pacContainers && pacContainers.length) {
      pacContainers[0].remove();
    }
    const ionAutocompleteInputs = document.getElementsByClassName('ion_autocomplete');
    this.autocompleteInput = ionAutocompleteInputs[ionAutocompleteInputs.length - 1].getElementsByTagName('input')[0];
    this.autocompleteInput.id = 'autocomplete';
    this.autocompleteInput.oninput = this.autocompleteInput.onfocus = this.fixAutocompletePosition.bind(this);
    this.preventAddressInputBlocking();

    if (typeof google === 'undefined') {
      this.logger.info('Start loading Google Maps...');
      this.mapsAPILoader.load().then(() => {
        this.logger.info('Google Maps loaded.');
        this.bindAutocompleteToInput();
      })
        .catch(e => {
          this.logger.warn('Cannot load maps API, address automplete will not work.', JSON.stringify(e));
        });
    } else {
      this.bindAutocompleteToInput();
    }
  }

  private bindAutocompleteToInput(): void {
    this.ngZone.runOutsideAngular(() => {
      // Run this outside angular zone. It seems Google Maps JS code does some strange things, possibly
      // running code from timer continously. I haven't been able to confirm this in debugger however
      // based on the fact that this breaks our E2E Protractor tests it seems to be true. The E2E tests
      // fail with script timeout errors which normally happens when you run never-ending code via timer.
      // This is because Protractor tries to be clever and waits for any asynchronous operations like
      // setInternval or network calls to finish before it proceeds to next steps. And so because whateve
      // this code is doing never finishes, Protractor keeps waiting and eventually fails with timeout.
      //
      // Moving this block of code outside angular zone cures the problem so most likely this is true
      // diagnosis of the problem, although I didn't confirm it fully since I don't want to spend hours
      // debugging Google's JS.

      const newYorkBiasBounds = new google.maps.LatLngBounds(new google.maps.LatLng(40.730610, -73.935242));
      google.maps.event.clearInstanceListeners(this.autocompleteInput);
      this.autocomplete = new google.maps.places.Autocomplete(this.autocompleteInput, {
        bounds: newYorkBiasBounds,
        types: ['address'] // 'address' instructs the Places service to return only geocoding results with a precise address.
      });

      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        this.address.patchValue(place.formatted_address);

        // Ensure the view updated:
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  private preventAddressInputBlocking(): void {
    window.gm_authFailure = (): boolean => {
      this.logger.warn('window.gm_authFailure(), disabling address autocomplete');
      this.autocompleteInput.disabled = false;
      this.autocompleteInput.placeholder = '';
      this.autocompleteInput.style.backgroundImage = '';
      return false;
    };
  }

  // Fix address autocomplete dropdown position relative to address input field.
  private fixAutocompletePosition = (): void => {
    const pacContainer = document.getElementsByClassName('pac-container')[0];
    if (pacContainer) {
      const pacContainerCarriers = document.getElementsByClassName('pac_container_carrier');
      const pacContainerCarrierIndex = pacContainerCarriers.length - 1;
      if (
        pacContainer &&
        pacContainerCarriers[pacContainerCarrierIndex] &&
        !pacContainerCarriers[pacContainerCarrierIndex].contains(pacContainer)
      ) {
        pacContainerCarriers[pacContainerCarrierIndex].appendChild(pacContainer);
      }
    }
  };
}
