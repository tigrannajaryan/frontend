import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { StatusBar } from '@ionic-native/status-bar';

import { loading } from '~/core/utils/loading';
import { createNavHistoryList } from '~/core/functions';
import { AuthApiService, FbAuthCredentials, UserRole } from '~/core/auth-api-service/auth-api-service';
import { PageNames } from '~/core/page-names';
import { LoginOrRegisterType } from '~/login-register/login-register.component';
import { showAlert } from '~/core/utils/alert';

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
  // this should be here if we using enum in html
  protected LoginOrRegisterType = LoginOrRegisterType;

  constructor(
    private navCtrl: NavController,
    private fb: Facebook,
    private authServiceProvider: AuthApiService,
    private alertCtrl: AlertController,
    private statusBar: StatusBar
  ) {
  }

  ionViewWillEnter(): void {
    this.statusBar.hide();
  }

  ionViewDidLeave(): void {
    this.statusBar.show();
  }

  goToPage(choosePageType: LoginOrRegisterType): void {
    this.navCtrl.push(PageNames.LoginRegister, { pageType: choosePageType }, { animate: false });
  }

  @loading
  async loginByFb(): Promise<void> {
    try {
      const fbResponse: FacebookLoginResponse = await this.fb.login(permission);

      if (fbResponse.status === connected) {
        const credentials: FbAuthCredentials = {
          fbAccessToken: fbResponse.authResponse.accessToken,
          fbUserID: fbResponse.authResponse.userID,
          role: UserRole.stylist
        };

        const authResponse = await this.authServiceProvider.loginByFb(credentials);

        // Find out what page should be shown to the user and navigate to
        // it while also properly populating the navigation history
        // so that Back buttons work correctly.
        this.navCtrl.setPages(createNavHistoryList(authResponse.profile_status));
      }
    } catch (e) {
      // Show an error message
      showAlert(this.alertCtrl, 'Login failed', 'Invalid email or password');
    }
  }
}
