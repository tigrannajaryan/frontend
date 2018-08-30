import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'welcome-info'
})
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome-page.component.html'
})
export class WelcomePageComponent {

  constructor(private navCtrl: NavController) {}

  protected onContinue(): void {
    this.navCtrl.push(PageNames.Home);
  }
}
