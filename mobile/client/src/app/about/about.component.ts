import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import { getBuildNumber } from '~/shared/get-build-number';
import { ENV } from '../../environments/environment.default';
import Licenses from '~/core/data/licenses.json';

declare const __COMMIT_HASH__: string;

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.component.html'
})
export class AboutComponent {
  getBuildNumber = getBuildNumber;
  __COMMIT_HASH__ = __COMMIT_HASH__;
  easterEggCounter = 0;
  appVersion: string;
  licenses = Licenses;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    verProvider: AppVersion
  ) {
    this.init(verProvider);
  }

  async init(verProvider: AppVersion): Promise<void> {
    try {
      this.appVersion = await verProvider.getVersionNumber();
    } catch (e) {
      // Most likely running in browser so Cordova is not available. Ignore.
      this.appVersion = 'Unknown';
    }
  }

  getEnv(): typeof ENV {
    return ENV;
  }

  onNameClick(): void {
    const easterEggMax = 5;
    if (++this.easterEggCounter >= easterEggMax) {
      this.easterEggCounter = 0;
      this.testMethodForNestedException();
    }
  }

  testMethodForNestedException(): void {
    throw new Error(' Not a real error, just for debugging');
  }

}
