import { Component, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { } from 'googlemaps';
import Autocomplete = google.maps.places.Autocomplete;
import { MapsAPILoader } from '@agm/core';

import {
  ActionSheetController,
  ActionSheetOptions,
  NavController,
  NavParams, Slides
} from 'ionic-angular';

import 'rxjs/add/operator/pluck';

import { Logger } from '~/shared/logger';
import { downscalePhoto, urlToFile } from '~/shared/image-utils';
import { PhotoSourceType } from '~/shared/constants';
import { BaseService } from '~/shared/api/base.service';
import { showAlert } from '~/shared/utils/alert';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import { StylistProfile, StylistProfileCompleteness } from '~/shared/api/stylist-app.models';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';
import { emptyOr } from '~/shared/validators';

declare var window: any;

export enum ProfileTabs {
  edit = 0,
  clientView = 1
}

export enum ProfileTabNames {
  edit = 'Edit',
  clientView = 'Preview as Client'
}

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.component.html'
})
export class ProfileComponent {
  @ViewChild(Slides) slides: Slides;
  form: FormGroup;
  autocomplete: Autocomplete;
  autocompleteInput: HTMLInputElement;
  activeTab: ProfileTabNames;
  stylistProfileCompleteness: StylistProfileCompleteness;

  refresherEnabled = true;
  ProfileTabNames = ProfileTabNames;
  ProfileTabs = ProfileTabs;
  PageNames = PageNames;
  tabs = [
    {
      name: ProfileTabNames.edit
    },
    {
      name: ProfileTabNames.clientView
    }
  ];

  rawPhone: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public profileData: ProfileDataStore,
    private baseService: BaseService,
    private domSanitizer: DomSanitizer,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController,
    private logger: Logger,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {
    this.form = this.formBuilder.group({
      first_name: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.maxLength(150)
      ]],
      salon_name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25)
      ]],
      salon_address: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      phone: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(17)
      ]],
      public_phone: ['', [
        Validators.minLength(5),
        Validators.maxLength(17)
      ]],
      // tslint:disable-next-line:no-null-keyword
      profile_photo_id: undefined,
      profile_photo_url: undefined,
      instagram_url: ['', Validators.pattern(/([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\\.(?!\\.))){0,28}(?:[A-Za-z0-9_]))?)/)],
      followers_count: [''],
      email: ['', [emptyOr(Validators.email)]],
      website_url: ['']
    });

    this.activeTab = this.tabs[ProfileTabs.edit].name;

    this.form.valueChanges.subscribe((stylistProfile: StylistProfile) => {
      this.stylistProfileCompleteness = calcProfileCompleteness(stylistProfile);
    });
  }

  async ionViewWillEnter(): Promise<void> {
    // loadFormInitialData must be called and finished before initAutocomplete because
    // initAutocomplete uses the apiKey that we get in loadFormInitialData.
    await this.loadFormInitialData();
    this.initAutocomplete();
  }

  @loading
  async loadFormInitialData(): Promise<void> {

    const { response } = await this.profileData.get();
    if (!response) {
      return;
    }

    const {
      profile_photo_url,
      first_name,
      last_name,
      phone,
      public_phone,
      salon_name,
      salon_address,
      profile_photo_id,
      instagram_url,
      followers_count,
      email,
      website_url
    } = response;

    this.rawPhone = phone;
    const formattedPhone = getPhoneNumber(phone);
    const formattedPublicPhone = getPhoneNumber(public_phone);

    this.form.patchValue({
      // tslint:disable-next-line:no-null-keyword
      profile_photo_url,
      first_name,
      last_name,
      phone: formattedPhone,
      public_phone: formattedPublicPhone,
      salon_name,
      salon_address,
      profile_photo_id,
      instagram_url,
      followers_count,
      email,
      website_url
    });
  }

  initAutocomplete(): void {
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

  bindAutocompleteToInput(): void {
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
        this.form.get('salon_address').patchValue(place.formatted_address);
      });
    });
  }

  // Global function called by Google API on auth errors.
  // Prevent Salon Address input field from blocking on error.
  preventAddressInputBlocking(): void {
    window.gm_authFailure = (): boolean => {
      this.logger.warn('window.gm_authFailure(), disabling address autocomplete');
      this.autocompleteInput.disabled = false;
      this.autocompleteInput.placeholder = '';
      this.autocompleteInput.style.backgroundImage = '';
      return false;
    };
  }

  // Fix address autocomplete dropdown position relative to address input field.
  fixAutocompletePosition(): void {
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
  }

  @loading
  async updateProfile(): Promise<void> {
    const { vars, ...profile } = this.form.value;
    const data = {
      ...profile,
      // use raw phone number (required field, cannot omit):
      phone: this.rawPhone,
      // remove @ from instagram username:
      instagram_url: profile.instagram_url && profile.instagram_url.replace(/^\@/, ''),
      // the API requires null if empty salon_name
      // tslint:disable-next-line:no-null-keyword
      salon_name: profile.salon_name || null
    };
    const { error } = await this.profileData.set(data);
    if (!error) {
      this.navCtrl.pop();
    }
  }

  processPhoto(): void {
    this.logger.info('processPhoto()');
    const opts: ActionSheetOptions = {
      buttons: [
        {
          text: 'Take Photo',
          handler: () => {
            this.takePhoto(PhotoSourceType.camera);
          }
        }, {
          text: 'Add Photo',
          handler: () => {
            this.takePhoto(PhotoSourceType.photoLibrary);
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    };

    if (this.form.get('profile_photo_url').value) {
      opts.buttons.splice(-1, 0, {
        text: 'Remove Photo',
        role: 'destructive',
        handler: () => {
          this.form.get('profile_photo_url').setValue(undefined);
          // tslint:disable-next-line:no-null-keyword
          this.form.get('profile_photo_id').setValue(null);
        }
      });
    }

    const actionSheet = this.actionSheetCtrl.create(opts);
    actionSheet.present();
  }

  onTabChange(tabIndex: ProfileTabs): void {
    this.slides.slideTo(tabIndex);
    this.activeTab = this.tabs[tabIndex].name;
  }

  onTabSwipe(): void {
    // if index more or equal to tabs length we got an error
    if (this.slides.getActiveIndex() >= this.tabs.length) {
      return;
    }
    this.activeTab = this.tabs[this.slides.getActiveIndex()].name;
  }

  onEnableRefresher(isEnabled: boolean): void {
    this.refresherEnabled = isEnabled;
  }

  @loading
  private async takePhoto(sourceType: PhotoSourceType): Promise<void> {
    let imageData;
    try {
      const options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        sourceType // PHOTOLIBRARY = 0, CAMERA = 1
      };

      imageData = await this.camera.getPicture(options);
    } catch (e) {
      showAlert('', 'Cannot take or add photo. Please make sure the App has the neccessary permissions.');
      return;
    }

    // imageData is either a base64 encoded string or a file URI
    // If it's base64:
    const originalBase64Image = `data:image/jpeg;base64,${imageData}`;

    const downscaledBase64Image = await downscalePhoto(originalBase64Image);

    // set image preview
    this.form.get('profile_photo_url')
      .setValue(this.domSanitizer.bypassSecurityTrustStyle(`url(${downscaledBase64Image})`));

    // convert base64 to File after to formData and send it to server
    const file = await urlToFile(downscaledBase64Image, 'file.png');
    const formData = new FormData();
    formData.append('file', file);

    const response: any = await this.baseService.uploadFile(formData);
    this.form.get('profile_photo_id').setValue(response.uuid);
  }
}
