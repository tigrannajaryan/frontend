import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { nextToShowForCompleteProfile } from '~/core/functions';
import { StylistAppStorage } from '~/core/stylist-app-storage';

@Component({
  selector: 'registration-done',
  templateUrl: 'registration-done.component.html'
})
export class RegistrationDoneComponent {

  constructor(
    private navCtrl: NavController,
    private storage: StylistAppStorage
  ) {}

  async onContinue(): Promise<void> {
    await this.storage.set('hideRegistrationDone', true);

    // Show push priming screen if needed. Otherwise show home.
    const { page, params } = await nextToShowForCompleteProfile();
    this.navCtrl.setRoot(page, params);
  }
}
