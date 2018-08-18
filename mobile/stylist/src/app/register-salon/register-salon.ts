import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { } from 'googlemaps';
import Autocomplete = google.maps.places.Autocomplete;
import { MapsAPILoader } from '@agm/core';

import {
  ActionSheetController,
  ActionSheetOptions,
  IonicPage,
  NavController,
  NavParams
} from 'ionic-angular';

import 'rxjs/add/operator/pluck';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { BaseApiService } from '~/shared/base-api-service';
import { Logger } from '~/shared/logger';
import { downscalePhoto, urlToFile } from '~/shared/image-utils';
import { PhotoSourceType } from '~/shared/constants';
import { showAlert } from '~/core/utils/alert';

declare var window: any;

@IonicPage({
  segment: 'register-salon'
})
@Component({
  selector: 'page-register-salon',
  templateUrl: 'register-salon.html'
})
export class RegisterSalonComponent {
  PageNames = PageNames;
  isMainScreen?: Boolean;
  form: FormGroup;
  autocomplete: Autocomplete;
  autocompleteInput: HTMLInputElement;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private apiService: StylistServiceProvider,
    private baseService: BaseApiService,
    private domSanitizer: DomSanitizer,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController,
    private logger: Logger,
    private mapsAPILoader: MapsAPILoader
  ) {
    this.form = this.formBuilder.group({
      vars: this.formBuilder.group({
        image: ''
      }),

      first_name: ['', [
        Validators.maxLength(25),
        Validators.minLength(2),
        Validators.required
      ]],
      last_name: ['', [
        Validators.maxLength(25),
        Validators.minLength(2),
        Validators.required
      ]],
      phone: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]],
      salon_name: ['', [
        Validators.maxLength(25),
        Validators.minLength(3),
        Validators.nullValidator
      ]],
      salon_address: ['', Validators.required],
      // tslint:disable-next-line:no-null-keyword
      profile_photo_id: null,
      instagram_url: ['', Validators.pattern(/@([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\\.(?!\\.))){0,28}(?:[A-Za-z0-9_]))?)/)],
      website_url: ['']
    });

  }

  ionViewWillEnter(): void {
    this.isMainScreen = Boolean(this.navParams.get('isMainScreen'));
    this.loadFormInitialData();
    this.initAutocomplete();
  }

  @loading
  async loadFormInitialData(): Promise<void> {
    const {
      profile_photo_url,
      first_name,
      last_name,
      phone,
      salon_name,
      salon_address,
      profile_photo_id,
      instagram_url,
      website_url
    } = await this.apiService.getProfile();

    this.form.patchValue({
      vars: { image: `url(${profile_photo_url})` },
      first_name,
      last_name,
      phone,
      salon_name,
      salon_address,
      profile_photo_id,
      instagram_url,
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
    this.autocompleteInput.oninput = this.autocompleteInput.onfocus = this.fixAutocompletePosition;
    this.preventAddressInputBlocking();

    if (typeof google === 'undefined') {
      this.mapsAPILoader.load().then(() => {
        this.bindAutocompleteToInput();
      })
        .catch(e => {
          this.logger.warn('Cannot load maps API, address automplete will not work.', e);
        });
    } else {
      this.bindAutocompleteToInput();
    }
  }

  bindAutocompleteToInput(): void {
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
  }

  // Global function called by Google API on auth errors.
  // Prevent Salon Address input field from blocking on error.
  preventAddressInputBlocking(): void {
    window.gm_authFailure = (): boolean => {
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

  nextRoute(): void {
    if (this.isMainScreen) {
      this.navCtrl.pop();
      return;
    }

    this.navCtrl.push(PageNames.DiscountsInfo);
  }

  @loading
  async onContinue(): Promise<void> {
    const { vars, ...profile } = this.form.value;
    const data = {
      ...profile,
      // the API requires null if empty salon_name
      // tslint:disable-next-line:no-null-keyword
      salon_name: profile.salon_name || null
    };
    await this.apiService.setProfile(data);
    this.nextRoute();
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

    if (this.form.get('vars.image').value) {
      opts.buttons.splice(-1, 0, {
        text: 'Remove Photo',
        role: 'destructive',
        handler: () => {
          this.form.get('vars.image').setValue('');
          // tslint:disable-next-line:no-null-keyword
          this.form.get('profile_photo_id').setValue(null);
        }
      });
    }

    const actionSheet = this.actionSheetCtrl.create(opts);
    actionSheet.present();
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
    this.form.get('vars.image')
      .setValue(this.domSanitizer.bypassSecurityTrustStyle(`url(${downscaledBase64Image})`));

    // convert base64 to File after to formData and send it to server
    const file = await urlToFile(downscaledBase64Image, 'file.png');
    const formData = new FormData();
    formData.append('file', file);

    const response: any = await this.baseService.uploadFile(formData);
    this.form.get('profile_photo_id')
      .setValue(response.uuid);
  }
}
