import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { profileStatusToPage } from '~/shared/functions';
import { AuthApiService, FbAuthCredentials, UserRole } from '~/shared/auth-api-service/auth-api-service';
import { PageNames } from '~/shared/page-names';
import { LoginOrRegisterType } from '~/login-register/login-register.component';

// Permissions of Facebook Login
// https://developers.facebook.com/docs/facebook-login/permissions/v3.0
const permission = ['public_profile', 'email'];
const connected = 'connected';

@IonicPage()
@Component({
  selector: 'page-first-screen',
  templateUrl: 'first-screen.html'
})
export class FirstScreenComponent {

  constructor(
    private navCtrl: NavController,
    private fb: Facebook,
    private authServiceProvider: AuthApiService,
    private alertCtrl: AlertController
  ) {
  }

  goToPage(choosePageType: LoginOrRegisterType): void {
    this.navCtrl.push(PageNames.LoginRegister, {pageType: choosePageType}, {animate: false});
  }

  async loginByFb(): Promise<void>  {
    try {
      const fbResponse: FacebookLoginResponse = await this.fb.login(permission);

      if (fbResponse.status === connected) {
        const credentials: FbAuthCredentials = {
          fbAccessToken: fbResponse.authResponse.accessToken,
          fbUserID: fbResponse.authResponse.userID,
          role: UserRole.stylist
        };

        const authResponse = await this.authServiceProvider.loginByFb(credentials);

        // Erase all previous navigation history and go the next
        // page that must be shown to this user.
        this.navCtrl.setRoot(profileStatusToPage(authResponse.profile_status));
      }
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
