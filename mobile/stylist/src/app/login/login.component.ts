import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { profileStatusToPage } from '../shared/functions';
import { AuthCredentials, AuthServiceProvider, UserRole } from '../shared/auth-service/auth-service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent {

  formData = { email: '', password: '' };
  passwordType = 'password';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public authService: AuthServiceProvider,
              private alertCtrl: AlertController) {
  }

  async login(): Promise<void> {
    try {
      const authCredentialsRecord: AuthCredentials = {
        email: this.formData.email,
        password: this.formData.password,
        role: UserRole.stylist
      };
      const authResponse = await this.authService.doAuth(authCredentialsRecord);

      // Auth successfull. Remember token in local storage.
      localStorage.setItem('authToken', JSON.stringify(authResponse.token));

      // process authResponse and move to needed page
      this.navCtrl.setRoot(profileStatusToPage(authResponse.profile_status));
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

  switchPasswordType(): void {
    this.passwordType = this.passwordType === 'password' ? 'type' : 'password';
  }

  reset(): void {
    // TODO: add api call when it will be ready
  }
}
