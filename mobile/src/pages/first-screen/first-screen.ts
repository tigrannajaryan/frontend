import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

import { PageNames } from '../page-names';

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
    private fb: Facebook
  ) {
  }

  loginByEmail(): void {
    this.navCtrl.push(PageNames.Login, {}, {animate: false});
  }

  register(): void {
    // this.navCtrl.push(PageNames.Services, {}, {animate: false});
    this.navCtrl.push(PageNames.RegisterByEmail, {}, {animate: false});
  }

  loginByFb(): void {
    this.fb.login(['public_profile', 'user_friends', 'email'])
      .then(res => {
        if (res.status === 'connected') {
          this.getUserDetail(res.authResponse.userID);
        }
      })
      .catch(e => console.dir('Error logging into Facebook', e));
  }

  getUserDetail(userid): void {
    this.fb.api(`/${userid}/?fields=id`, ['public_profile'])
      .then(res => {
        console.dir(res);
      })
      .catch(e => {
        console.dir(e);
      });
  }
}
