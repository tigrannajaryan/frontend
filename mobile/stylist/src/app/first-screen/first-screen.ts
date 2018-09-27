import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { PageNames } from '~/core/page-names';
import { LoginOrRegisterType } from '~/login-register/login-register.component';

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

  login(): void {
    this.navCtrl.push(PageNames.Auth);
  }
}
