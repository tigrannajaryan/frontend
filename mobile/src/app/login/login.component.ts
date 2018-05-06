import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { profileStatusToPage } from '../shared/functions';
import { AuthServiceProvider } from '../shared/auth-service/auth-service';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent {

  formData = { email: '', password: '' };

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public authService: AuthServiceProvider,
              private alertCtrl: AlertController) {
  }

  async login(): Promise<void> {
    try {
      const authResponse = await this.authService.doAuth(this.formData);

      // Auth successfull. Remember token in local storage.
      localStorage.setItem('authToken', JSON.stringify(authResponse.token));

      // process authResponse and move to needed page
      this.navCtrl.setRoot(profileStatusToPage(authResponse.stylist_profile_status));
    } catch (e) {
      // Show an error message
      const alert = this.alertCtrl.create({
        title: 'Login failed',
        subTitle: 'Invalid email or password',
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
}
