import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActionSheetController, ActionSheetOptions, IonicPage, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Store } from '@ngrx/store';

import { PhotoSourceType } from '~/shared/constants';
import { getImageFormData } from '~/shared/image-utils';
import { emptyOr } from '~/shared/validators';
import { BaseApiService } from '~/shared/base-api-service';

import { showAlert } from '~/core/utils/alert';
import { composeRequest, loading, withForm } from '~/core/utils/request-utils';
import { emailValidator } from '~/core/validators/email.validator';
import { ProfileService } from '~/core/api/profile-service';
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

  private photoUploadOptions: ActionSheetOptions;
  private cameraOptions: CameraOptions;

  private readonly DEFAULT_IMAGE = 'url(/assets/imgs/user/default_user.png)';

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private baseApiService: BaseApiService,
    private camera: Camera,
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private profileService: ProfileService
  ) {
  }

  ionViewCanEnter(): boolean {
    return Boolean(this.navParams.get('profile'));
  }

  ionViewWillLoad(): void {
    const profile: ProfileModel = this.navParams.get('profile');

    this.form = this.formBuilder.group({
      first_name: [profile.first_name],
      last_name: [profile.last_name],
      email: [profile.email, [
        emptyOr(emailValidator())
      ]],
      zip_code: [profile.zip_code, [
        emptyOr(Validators.minLength(5))
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
        Boolean(this.form.value.profile_photo_url) &&
          {
            text: 'Remove Photo',
            role: 'destructive',
            handler: () => {
              this.form.patchValue({
                profile_photo_url: '',
                profile_photo_id: undefined
              });
            }
          }
      ]
    };
    this.actionSheetCtrl.create(options).present();
  }

  onSubmit(): void {
    composeRequest(
      withForm(this.form),
      loading(isLoading => this.isUpdating = isLoading),
      this.profileService.updateProfile(this.form.value)
    );
  }

  private async takePhoto(sourceType: PhotoSourceType): Promise<void> {
    let imageUrl;
    try {
      // Get photo from camera plugin:
      imageUrl = await this.camera.getPicture({
        ...this.cameraOptions,
        sourceType // PHOTOLIBRARY = 0, CAMERA = 1
      });
    } catch (e) {
      showAlert('Cannot take or add photo', 'Please make sure the App has the necessary permissions.');
      return;
    }

    let uuid;
    try {
      // Upload photo to the API:
      const formData = await getImageFormData(imageUrl);
      const response = await this.baseApiService.uploadFile<{ uuid: string }>(formData);
      uuid = response.uuid;
    } catch (e) {
      showAlert('Saving photo failed');
      return;
    }

    // Update url and save id to the form:
    this.form.patchValue({
      profile_photo_url: imageUrl,
      profile_photo_id: uuid
    });
  }
}
