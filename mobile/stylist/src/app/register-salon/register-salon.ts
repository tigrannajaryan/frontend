import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';

import {
  ActionSheetController,
  AlertController,
  IonicPage,
  NavController,
  NavParams
} from 'ionic-angular';

import 'rxjs/add/operator/pluck';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { BaseApiService } from '~/shared/base-api-service';
import { showAlert } from '~/core/utils/alert';

enum PhotoSourceType {
  photoLibrary = 0,
  camera = 1
}

@IonicPage({
  segment: 'register-salon'
})
@Component({
  selector: 'page-register-salon',
  templateUrl: 'register-salon.html'
})
export class RegisterSalonComponent {
  protected PageNames = PageNames;
  isProfile?: Boolean;
  form: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private apiService: StylistServiceProvider,
    private baseService: BaseApiService,
    private alertCtrl: AlertController,
    private domSanitizer: DomSanitizer,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController
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
      profile_photo_id: undefined
    });

  }

  ionViewDidLoad(): void {
    this.isProfile = Boolean(this.navParams.get('isProfile'));

    this.loadFormInitialData();
  }

  @loading
  async loadFormInitialData(): Promise<void> {
    try {
      const {
        profile_photo_url,
        first_name,
        last_name,
        phone,
        salon_name,
        salon_address,
        profile_photo_id
      } = await this.apiService.getProfile();

      this.form.patchValue({
        vars: {image: `url(${profile_photo_url})`},
        first_name,
        last_name,
        phone,
        salon_name,
        salon_address,
        profile_photo_id
      });
    } catch (e) {
      showAlert(this.alertCtrl, 'Loading profile failed', e.message);
    }
  }

  nextRoute(): void {
    if (this.isProfile) {
      this.navCtrl.pop();
      return;
    }

    this.navCtrl.push(PageNames.RegisterServices, {}, { animate: false });
  }

  @loading
  async submit(): Promise<void> {
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
    const buttons = [
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
    ];

    if (this.form.get('vars.image').value) {
      buttons.splice(-1, 0, {
        text: 'Remove Photo',
        role: 'destructive',
        handler: () => {
          this.form.get('vars.image').setValue('');
          this.form.get('profile_photo_id').setValue(undefined);
        }
      });
    }

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  // convert base64 to File
  protected urlToFile(url: string, filename: string, mimeType?): Promise<File> {
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    return (fetch(url).catch(e => { throw e; })
      .then(res => res.arrayBuffer())
      .then(buf => new File([buf], filename, {type: mimeType})));
  }

  @loading
  private async takePhoto(sourceType: PhotoSourceType): Promise<void> {
    try {
      const options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        sourceType // PHOTOLIBRARY = 0, CAMERA = 1
      };

      const imageData = await this.camera.getPicture(options);
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      const base64Image = `data:image/jpeg;base64,${imageData}`;

      // set image preview
      this.form.get('vars.image')
        .setValue(this.domSanitizer.bypassSecurityTrustStyle(`url(${base64Image})`));

      // convert base64 to File after to formData and send it to server
      const file = await this.urlToFile(base64Image, 'file.png');
      const formData = new FormData();
      formData.append('file', file);

      const response: any = await this.baseService.uploadFile(formData);
      this.form.get('profile_photo_id')
        .setValue(response.uuid);

    } catch (e) {
      showAlert(this.alertCtrl, 'Saving photo failed', e.message);
    }
  }
}
