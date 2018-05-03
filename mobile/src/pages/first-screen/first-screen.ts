import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

import { PageNames } from '../page-names';
import { AuthServiceProvider, FbAuthCredentials } from '../../providers/auth-service/auth-service';

/**
 * Generated class for the FirstScreenPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-first-screen',
  templateUrl: 'first-screen.html'
})
export class FirstScreenComponent {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private fb: Facebook,
    private authServiceProvider: AuthServiceProvider
  ) {
  }

  loginByEmail(): void {
    this.navCtrl.push(PageNames.Login, {}, {animate: false});
  }

  register(): void {
    this.navCtrl.push(PageNames.RegisterByEmail, {}, {animate: false});
  }

  registerByFb(): void {
    this.fb.login(['public_profile', 'user_friends', 'email'])
      .then(res => {
        if (res.status === 'connected') {
          const credentials: FbAuthCredentials = {
            fbAccessToken: res.authResponse.accessToken,
            fbUserID: res.authResponse.userID
          };

          this.authServiceProvider.registerByFb(credentials);
        }
      })
      .catch(e => console.dir('Error logging into Facebook', e));
  }
}
