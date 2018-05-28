import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';

import {
  ActionSheetController,
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams
} from 'ionic-angular';

import 'rxjs/add/operator/pluck';

import { PageNames } from '~/core/page-names';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { BaseApiService } from '~/shared/base-api-service';

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
  PageNames = PageNames;
  isProfile?: Boolean;
  form: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private apiService: StylistServiceProvider,
    private baseService: BaseApiService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private domSanitizer: DomSanitizer,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController) {

  }

  ionViewWillLoad(): void {
    this.isProfile = Boolean(this.navParams.get('isProfile'));

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

    this.loadFormInitialData();
  }

  async loadFormInitialData(): Promise<void> {
    const loader = this.loadingCtrl.create();
    loader.present();

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
        vars: {image: profile_photo_url},
        first_name,
        last_name,
        phone,
        salon_name,
        salon_address,
        profile_photo_id
      });
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Loading profile failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();
    } finally {
      loader.dismiss();
    }
  }

  nextRoute(): void {
    if (this.isProfile) {
      this.navCtrl.pop();
      return;
    }

    this.navCtrl.push(PageNames.RegisterServices, {}, { animate: false });
  }

  async submit(): Promise<void> {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      const { vars, ...profile } = this.form.value;
      await this.apiService.setProfile(profile);

      this.nextRoute();
    } finally {
      loading.dismiss();
    }
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

  private takePhoto(sourceType: PhotoSourceType): void {
    const loading = this.loadingCtrl.create();

    try {
      loading.present();

      const options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        sourceType // PHOTOLIBRARY = 0, CAMERA = 1
      };

      this.camera.getPicture(options).then(imageData => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        const base64Image = `data:image/jpeg;base64,${imageData}`;

        // set image preview
        this.form.get('vars.image')
          .setValue(this.domSanitizer.bypassSecurityTrustStyle(`url(${base64Image})`));

        // convert base64 to File after to formData and send it to server
        this.urlToFile(base64Image, 'file.png')
          .then(file => {
            const formData = new FormData();
            formData.append('file', file);
            this.baseService.uploadFile(formData)
              .then((res: any) => {
                this.form.get('profile_photo_id')
                  .setValue(res.uuid);
              });
          });
      });
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Saving photo failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();
    } finally {
      loading.dismiss();
    }
  }
}
