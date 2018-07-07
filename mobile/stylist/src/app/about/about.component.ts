import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import { getBuildNumber } from '~/core/functions';
import { ENV } from '../../environments/environment.default';

declare const __COMMIT_HASH__: string;

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.component.html'
})
export class AboutComponent {

  protected getBuildNumber = getBuildNumber;
  protected __COMMIT_HASH__ = __COMMIT_HASH__;
  protected easterEggCounter = 0;
  protected appVersion: string;

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
      // most likely running in browser so Cordova is not available. Ignore.
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
      throw new Error(' Not a real error, just for debugging');
    }
  }

}
