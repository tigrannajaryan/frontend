import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'first-screen'
})
@Component({
  selector: 'first-screen',
  templateUrl: 'first-screen.component.html'
})
export class FirstScreenComponent {

  constructor(private navCtrl: NavController) {}

  getStarted(): void {
    this.navCtrl.setRoot(PageNames.Auth);
  }
}
