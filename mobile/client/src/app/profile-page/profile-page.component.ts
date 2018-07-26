import { Component } from '@angular/core';
import { ActionSheetController, ActionSheetOptions, IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {
  ProfileState,
  RequestGetProfileAction, RequestUpdateImage,
  RequestUpdateProfileAction,
  selectIsLoading,
  selectProfile
} from '~/core/reducers/profile.reducer';
import { ISubscription } from 'rxjs/Subscription';
import { ProfileModel } from '~/core/api/profile.models';
import { EmailValidator } from '~/shared/validators';
import { PhotoSourceType } from '~/shared/constants';
import { downscalePhoto, urlToFile } from '../../../../shared/image-utils';
import { DomSanitizer } from '@angular/platform-browser';
import { showAlert } from '~/core/utils/alert';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile-page.component.html'
})
export class ProfilePageComponent {

  readonly DEFAULT_IMAGE = 'url(/assets/imgs/user/default_user.png)';
  protected form: FormGroup;

  protected subscriptions: ISubscription[];
  protected currentImage;

  isLoading = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public formBuilder: FormBuilder,
              public store: Store<ProfileState>,
              protected camera: Camera,
              protected domSanitizer: DomSanitizer,
              protected actionSheetCtrl: ActionSheetController
  ) {
    // Init subscriptions
    this.subscriptions = [];
    this.initForm();
  }

  ionViewWillEnter(): void {
    this.store.dispatch(new RequestGetProfileAction());
    this.subscriptions.push(this.store.select(selectIsLoading)
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      }));
    this.subscriptions.push(this.store.select(selectProfile)
      .subscribe((profile: ProfileModel) => {
        if (!profile.profile_photo_url) {
          this.currentImage = this.DEFAULT_IMAGE;
        } else {
          this.currentImage = `url(${profile.profile_photo_url})`;
        }
        this.form.patchValue(profile);
      }));
  }

  ionViewDidLeave(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  processPhoto(): void {
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
    if (this.currentImage) {
      opts.buttons.splice(-1, 0, {
        text: 'Remove Photo',
        role: 'destructive',
        handler: () => {
          this.currentImage = this.DEFAULT_IMAGE;
          this.form.get('profile_photo_id').setValue(undefined);
        }
      });
    }
    const actionSheet = this.actionSheetCtrl.create(opts);
    actionSheet.present();
  }

  submit(): void {
    const profileModel = {
      ...this.form.value
    };
    this.store.dispatch(new RequestUpdateProfileAction(profileModel));
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
      // set image preview
      this.currentImage = this.domSanitizer.bypassSecurityTrustStyle(`url(${downscaledBase64Image})`);
      // convert base64 to File after to formData and send it to server
      const file = await urlToFile(downscaledBase64Image, 'file.png');
      const formData = new FormData();
      formData.append('file', file);
      this.store.dispatch(new RequestUpdateImage(formData));
    } catch (e) {
      showAlert('Saving photo failed', e.message);
    }
  }

  private initForm(): void {
    // Form initialization.
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
      ]],
      profile_photo_id: [''],
      profile_photo_url: ['']
    });
  }

}
