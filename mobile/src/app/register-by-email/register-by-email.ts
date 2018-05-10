import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';

import { AuthApiService, AuthCredentials, UserRole } from '../shared/auth-api-service/auth-api-service';
import { PageNames } from '../shared/page-names';

/**
 * Generated class for the RegisterByEmailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register-by-email',
  templateUrl: 'register-by-email.html'
})
export class RegisterByEmailComponent {

  formData = { email: '', password: '' };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authService: AuthApiService,
    private loadingCtrl: LoadingController) {
  }

  async register(): Promise<void> {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      const authCredentialsRecord: AuthCredentials = {
        email: this.formData.email,
        password: this.formData.password,
        role: UserRole.stylist
      };
      await this.authService.registerByEmail(authCredentialsRecord);

      this.navCtrl.push(PageNames.RegisterSalon, {}, { animate: false });
    } finally {
      loading.dismiss();
    }
  }
}
