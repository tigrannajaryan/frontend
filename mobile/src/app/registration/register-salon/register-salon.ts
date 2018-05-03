import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/operator/pluck';

import { PageNames } from '../../../pages/page-names';
import { StylistServiceProvider } from '../../../providers/stylist-service/stylist-service';
import { BaseServiceProvider } from '../../../providers/base-service';

/**
 * Generated class for the RegisterSalonPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
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
    public fb: FormBuilder,
    private apiService: StylistServiceProvider,
    private baseService: BaseServiceProvider,
    private alertCtrl: AlertController,
    private domSanitizer: DomSanitizer) {

  }

  ionViewWillLoad(): void {
    this.form = this.fb.group({
      vars: this.fb.group({
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
      profile_photo_id: ''
    });
  }

  processWebImage(event): void {
    try {
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
    }
  }

  async next(): Promise<void> {
    try {
      const { vars, ...profile } = this.form.value;

      // TODO: decide on fullname vs firstname/last and add phone field to the form.
      await this.apiService.setProfile(profile);

      this.navCtrl.push(PageNames.RegisterServices, {}, { animate: false });
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Saving profile information failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
}
