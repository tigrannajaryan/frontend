import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { AuthServiceProvider } from '../shared/auth-service/auth-service';
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
    private authService: AuthServiceProvider,
    private alertCtrl: AlertController) {
  }

  async register(): Promise<void> {
    try {
      await this.authService.registerByEmail(this.formData);
      this.navCtrl.push(PageNames.RegisterSalon, {}, { animate: false });
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Registration failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
}
