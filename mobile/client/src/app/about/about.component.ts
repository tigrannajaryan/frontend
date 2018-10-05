import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import { getBuildNumber, getCommitHash } from '~/shared/get-build-number';
import { ENV } from '~/environments/environment.default';
import Licenses from '~/core/data/licenses.json';

@Component({
  selector: 'page-about',
  templateUrl: 'about.component.html'
})
export class AboutComponent {
  getBuildNumber = getBuildNumber;
  commitHash = getCommitHash;
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
    throw new Error('This error looks like "Error: Loading chunk 19 failed" but it is really just a test message.');
  }

}
