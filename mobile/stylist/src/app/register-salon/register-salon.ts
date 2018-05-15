import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams
} from 'ionic-angular';

import 'rxjs/add/operator/pluck';

import { PageNames } from '../shared/page-names';
import { StylistServiceProvider } from '../shared/stylist-service/stylist-service';
import { BaseApiService } from '../shared/base-api-service';

/**
 * Generated class for the RegisterSalonPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  segment: 'register-salon'
})
@Component({
  selector: 'page-register-salon',
  templateUrl: 'register-salon.html'
})
export class RegisterSalonComponent {
  PageNames = PageNames;
  form: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private apiService: StylistServiceProvider,
    private baseService: BaseApiService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private domSanitizer: DomSanitizer) {

  }

  ionViewWillLoad(): void {
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

  processWebImage(event): void {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      // convert to base64 and show it
      const reader = new FileReader();
      reader.onload = readerEvent => {
        const imageData = (readerEvent.target as any).result;
        this.form.get('vars.image')
          .setValue(this.domSanitizer.bypassSecurityTrustStyle(`url(${imageData})`));
      };
      reader.readAsDataURL(event.target.files[0]);

      // get file and convert to formData
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.baseService.uploadFile(formData)
        .then((res: any) => {

          this.form.get('profile_photo_id')
            .setValue(res.uuid);
        });
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Saving photo failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();

      // reset on cancel
      this.form.get('vars.image').setValue('');
      this.form.get('profile_photo_id').setValue(undefined);
    } finally {
      loading.dismiss();
    }
  }

  async next(): Promise<void> {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      const { vars, ...profile } = this.form.value;
      await this.apiService.setProfile(profile);

      this.navCtrl.push(PageNames.RegisterServices, {}, { animate: false });
    } finally {
      loading.dismiss();
    }
  }
}
