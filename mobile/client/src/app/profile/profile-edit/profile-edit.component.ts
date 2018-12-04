import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ActionSheetOptions, NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { PhotoSourceType } from '~/shared/constants';
import { downscalePhoto, urlToFile } from '~/shared/image-utils';
import { BaseService } from '~/shared/api/base.service';
import { emptyOr } from '~/shared/validators';
import { showAlert } from '~/shared/utils/alert';

import { DefaultImage } from '~/core/core.module';
import { ProfileModel } from '~/core/api/profile.models';

import { ProfileDataStore } from '~/profile/profile.data';

@Component({
  selector: 'profile-edit',
  templateUrl: 'profile-edit.component.html'
})
export class ProfileEditComponent {
  form: FormGroup;

  readonly DEFAULT_IMAGE = DefaultImage.User;

  // Indicates whether user pic has been changed or not:
  private picChanged = false;

  private photoUploadOptions: ActionSheetOptions;
  private cameraOptions: CameraOptions;

  constructor(
    public profileDataStore: ProfileDataStore,
    private actionSheetCtrl: ActionSheetController,
    private baseService: BaseService,
    private camera: Camera,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
  }

  ionViewCanEnter(): boolean {
    return Boolean(this.navParams.get('profile'));
  }

  ionViewWillLoad(): void {
    const profile: ProfileModel = this.navParams.get('profile');

    this.form = this.formBuilder.group({
      first_name: [profile.first_name, [
        Validators.required,
        Validators.maxLength(30)
      ]],
      last_name: [profile.last_name, [
        Validators.required,
        Validators.maxLength(150)
      ]],
      email: [profile.email, [
        emptyOr(Validators.email)
      ]],
      zip_code: [profile.zip_code, [
        Validators.minLength(5)
      ]],
      profile_photo_url: [profile.profile_photo_url],
      profile_photo_id: [profile.profile_photo_id]
    });

    this.photoUploadOptions = {
      buttons: [
        {
          text: 'Take Photo',
          handler: this.takePhoto.bind(this, PhotoSourceType.camera)
        }, {
          text: 'Add Photo',
          handler: this.takePhoto.bind(this, PhotoSourceType.photoLibrary)
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    };

    this.cameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    };
  }

  onProcessPhoto(): void {
    const options: ActionSheetOptions = {
      buttons: [
        ...this.photoUploadOptions.buttons,
        ...Boolean(this.form.value.profile_photo_url) ?
          [{
            text: 'Remove Photo',
            role: 'destructive',
            handler: () => {
              this.form.patchValue({
                profile_photo_url: '',
                // tslint:disable-next-line:no-null-keyword
                profile_photo_id: null
              });
              this.picChanged = true;
            }
          }] : []
      ]
    };
    this.actionSheetCtrl.create(options).present();
  }

  async onSubmit(): Promise<void> {
    const value = {
      ...this.form.value,
      // Add pic id only if it has been changed in order to not reset it by passing null:
      profile_photo_id: this.picChanged ? this.form.value.profile_photo_id : undefined
    };

    const updated = await this.profileDataStore.set(value);

    if (updated && updated.response) {
      this.form.patchValue(updated.response);
      this.navCtrl.pop();
    }
  }

  private async takePhoto(sourceType: PhotoSourceType): Promise<void> {
    let imageData;
    try {
      // Get photo from camera plugin:
      imageData = await this.camera.getPicture({
        ...this.cameraOptions,
        sourceType // PHOTOLIBRARY = 0, CAMERA = 1
      });
    } catch (e) {
      showAlert('Cannot take or add photo', 'Please make sure the App has the necessary permissions.');
      return;
    }

    try {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      const originalBase64Image = `data:image/jpeg;base64,${imageData}`;
      const downscaledBase64Image = await downscalePhoto(originalBase64Image);

      // convert base64 to File after to formData and send it to server
      const file = await urlToFile(downscaledBase64Image, 'file.png');
      const formData = new FormData();
      formData.append('file', file);

      const response: any = await this.baseService.uploadFile<{ uuid: string }>(formData);

      // Update url and save id to the form:
      this.form.patchValue({
        profile_photo_url: downscaledBase64Image,
        profile_photo_id: response.uuid
      });

      this.picChanged = true;

    } catch (e) {
      showAlert('Saving photo failed', 'We are working on fixing it, please, retry later.');
      return;
    }
  }
}
