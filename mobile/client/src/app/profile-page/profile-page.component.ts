import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActionSheetController, ActionSheetOptions, IonicPage } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Store } from '@ngrx/store';

import { EmailValidator } from '~/shared/validators';
import { PhotoSourceType } from '~/shared/constants';
import { downscalePhoto, urlToFile } from '~/shared/image-utils';

import { showAlert } from '~/core/utils/alert';
import { componentIsActive } from '~/core/utils/component-is-active';

import {
  GetProfileAction,
  ProfileState,
  selectIsLoading,
  selectProfile,
  UpdateImage,
  UpdateProfileAction
} from '~/core/reducers/profile.reducer';
import { ProfileModel } from '~/core/api/profile.models';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile-page.component.html'
})
export class ProfilePageComponent {
  photoUrl: SafeStyle;
  form: FormGroup;

  isLoading = false;

  private readonly DEFAULT_IMAGE = 'url(/assets/imgs/user/default_user.png)';

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private store: Store<ProfileState>
  ) {
  }

  ionViewWillLoad(): void {
    this.form = this.formBuilder.group({
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
      email: ['', [
        new EmailValidator(),
        Validators.required
      ]],
      zip_code: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]]
    });
  }

  ionViewWillEnter(): void {
    this.store.select(selectIsLoading)
      .takeWhile(componentIsActive(this))
      .subscribe(isLoading => {
        // TODO: change to request state
        this.isLoading = isLoading;
      });

    this.store.select(selectProfile)
      .takeWhile(componentIsActive(this))
      .subscribe((profile: ProfileModel) => {
        this.photoUrl = this.domSanitizer.bypassSecurityTrustStyle(`url(${profile.profile_photo_url || this.DEFAULT_IMAGE})`);
        this.form.patchValue(profile);
      });

    this.store.dispatch(new GetProfileAction());
  }

  onProcessPhoto(): void {
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
    if (this.photoUrl) {
      opts.buttons.push({
        text: 'Remove Photo',
        role: 'destructive',
        handler: () => {
          this.photoUrl = this.DEFAULT_IMAGE;
        }
      });
    }
    const actionSheet = this.actionSheetCtrl.create(opts);
    actionSheet.present();
  }

  onSubmit(): void {
    this.store.dispatch(new UpdateProfileAction(this.form.value));
  }

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
      showAlert('', 'Cannot take or add photo. Please make sure the App has the necessary permissions.');
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
      this.store.dispatch(new UpdateImage(downscaledBase64Image, formData));
    } catch (e) {
      showAlert('Saving photo failed', e.message);
    }
  }
}
