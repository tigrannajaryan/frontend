import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController, ActionSheetOptions, NavController, NavParams } from 'ionic-angular';

import { BaseService } from '~/shared/api/base.service';
import { PhotoSourceType } from '~/shared/constants';
import { downscalePhoto, urlToFile } from '~/shared/image-utils';
import { Logger } from '~/shared/logger';
import { showAlert } from '~/shared/utils/alert';

import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';

import { RegistrationForm } from '~/onboarding/registration.form';

export interface StylistPhotoComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'stylist-photo',
  templateUrl: 'stylist-photo.component.html'
})
export class StylistPhotoComponent implements OnInit {
  params: StylistPhotoComponentParams;

  private photoId: FormControl;
  private photoUrl: FormControl;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private baseService: BaseService,
    private camera: Camera,
    private logger: Logger,
    private navCtrl: NavController,
    private navParams: NavParams,
    private registrationForm: RegistrationForm
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.params = this.navParams.get('params') || {};

    const { profile_photo_id, profile_photo_url } = this.registrationForm.getFormControls();

    this.photoId = profile_photo_id;
    this.photoUrl = profile_photo_url;

    if (this.params.isRootPage) {
      await this.registrationForm.loadFormInitialData();
    }
  }

  hasPhoto(): boolean {
    return Boolean(this.photoId.value) || Boolean(this.photoUrl.value);
  }

  @loading
  async onNavigateNext(): Promise<void> {
    await this.registrationForm.save();

    if (!this.params.isRootPage) {
      this.navCtrl.push(PageNames.WelcomeToMade);
    } else {
      this.navCtrl.popToRoot();
    }
  }

  async onContinue(): Promise<void> {
    if (!this.hasPhoto()) {
      this.processPhoto();
      return;
    }
    this.onNavigateNext();
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

    if (this.hasPhoto()) {
      opts.buttons.splice(-1, 0, {
        text: 'Remove Photo',
        role: 'destructive',
        handler: () => {
          this.photoUrl.setValue('');
          // tslint:disable-next-line:no-null-keyword
          this.photoId.setValue(null);
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
      const capitalize = e.charAt(0).toUpperCase() + e.slice(1);
      showAlert('', capitalize);
      return;
    }

    // imageData is either a base64 encoded string or a file URI
    // If it's base64:
    const originalBase64Image = `data:image/jpeg;base64,${imageData}`;

    const downscaledBase64Image = await downscalePhoto(originalBase64Image);

    // set image preview
    this.photoUrl.setValue(downscaledBase64Image);

    // convert base64 to File after to formData and send it to server
    const file = await urlToFile(downscaledBase64Image, 'file.png');
    const formData = new FormData();
    formData.append('file', file);

    const { response } = await this.baseService.uploadFile<{ uuid: string }>(formData).toPromise();
    this.photoId.setValue(response.uuid);
  }
}
