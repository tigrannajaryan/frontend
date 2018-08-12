import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ActionSheetOptions, IonicPage, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { PhotoSourceType } from '~/shared/constants';
import { downscalePhoto, urlToFile } from '~/shared/image-utils';
import { BaseApiService } from '~/shared/base-api-service';

import { showAlert } from '~/core/utils/alert';
import { composeRequest, loading } from '~/core/utils/request-utils';
import { animateFailed, animateSucceeded } from '~/core/utils/animation-utils';
import { DefaultImage } from '~/core/core.module';
import { ProfileService } from '~/core/api/profile-service';
import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileModel } from '~/core/api/profile.models';

@IonicPage()
@Component({
  selector: 'profile-edit',
  templateUrl: 'profile-edit.component.html'
})
export class ProfileEditComponent {
  form: FormGroup;

  isLoading = false;
  isUpdating = false;
  isFailed = false;
  isSucceeded = false;

  readonly DEFAULT_IMAGE = `url(${DefaultImage.User})`;

  private photoUploadOptions: ActionSheetOptions;
  private cameraOptions: CameraOptions;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private baseApiService: BaseApiService,
    private camera: Camera,
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private profileDataStore: ProfileDataStore,
    private profileService: ProfileService
  ) {
  }

  ionViewCanEnter(): boolean {
    return Boolean(this.navParams.get('profile'));
  }

  ionViewWillLoad(): void {
    const profile: ProfileModel = this.navParams.get('profile');

    this.form = this.formBuilder.group({
      first_name: [profile.first_name, [
        Validators.required
      ]],
      last_name: [profile.last_name, [
        Validators.required
      ]],
      email: [profile.email, [
        Validators.required,
        Validators.email
      ]],
      zip_code: [profile.zip_code, [
        Validators.required,
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
                profile_photo_id: undefined
              });
            }
          }] : []
      ]
    };
    this.actionSheetCtrl.create(options).present();
  }

  async onSubmit(): Promise<void> {
    const { response, error } = await composeRequest<ProfileModel>(
      loading(isLoading => this.isUpdating = isLoading),
      animateFailed(isFailed => this.isFailed = isFailed),
      animateSucceeded(isSucceeded => this.isSucceeded = isSucceeded),
      this.profileService.updateProfile(this.form.value)
    );
    if (response) {
      this.profileDataStore.set(response);
      this.form.patchValue(response);
    } else if (error) {
      // TODO: handle ”email is already taken by another user”
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

      const response: any = await this.baseApiService.uploadFile<{ uuid: string }>(formData);

      // Update url and save id to the form:
      this.form.patchValue({
        profile_photo_url: downscaledBase64Image,
        profile_photo_id: response.uuid
      });

    } catch (e) {
      showAlert('Saving photo failed', 'We are working on fixing it, please, retry later.');
      return;
    }
  }
}
