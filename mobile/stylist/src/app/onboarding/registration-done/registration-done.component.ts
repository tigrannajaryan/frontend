import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'registration-done',
  templateUrl: 'registration-done.component.html'
})
export class RegistrationDoneComponent {

  constructor(
    private navCtrl: NavController
  ) {}

  async onContinue(): Promise<void> {
    this.navCtrl.setRoot(PageNames.HomeSlots);
  }
}
