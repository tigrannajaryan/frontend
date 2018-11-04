import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import { getBuildNumber, getCommitHash } from '~/shared/get-build-info';
import { ENV } from '~/environments/environment.default';
import Licenses from '~/core/data/licenses.json';

@Component({
  selector: 'page-about',
  templateUrl: 'about.component.html'
})
export class AboutComponent {

  protected getBuildNumber = getBuildNumber;
  protected commitHash = getCommitHash;
  protected easterEggCounter = 0;
  protected appVersion: string;
  protected licenses = Licenses;

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

  protected getEnv(): typeof ENV {
    return ENV;
  }

  protected onNameClick(): void {
    const easterEggMax = 5;
    if (++this.easterEggCounter >= easterEggMax) {
      this.easterEggCounter = 0;
      this.testMethodForNestedException();
    }
  }

  protected testMethodForNestedException(): void {
    throw new Error(' Not a real error, just for debugging');
  }

}
