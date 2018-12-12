import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { nextToShowForCompleteProfile } from '~/core/functions';

@Component({
  selector: 'registration-done',
  templateUrl: 'registration-done.component.html'
})
export class RegistrationDoneComponent {

  constructor(
    private navCtrl: NavController
  ) {}

  async onContinue(): Promise<void> {
    // Show push priming screen if needed. Otherwise show home.
    const { page, params } = await nextToShowForCompleteProfile();
    this.navCtrl.setRoot(page, params);
  }
}
