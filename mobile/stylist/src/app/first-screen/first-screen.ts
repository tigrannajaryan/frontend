import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { PageNames } from '~/core/page-names';

@IonicPage()
@Component({
  selector: 'page-first-screen',
  templateUrl: 'first-screen.html'
})
export class FirstScreenComponent {
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

  login(): void {
    this.navCtrl.push(PageNames.Auth);
  }
}
