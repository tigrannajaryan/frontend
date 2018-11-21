import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { getAppVersionNumber, getBuildNumber, getCommitHash } from '~/shared/get-build-info';
import { ENV } from '~/environments/environment.default';
import Licenses from '~/core/data/licenses.json';

@Component({
  selector: 'page-about',
  templateUrl: 'about.component.html'
})
export class AboutComponent {
  getAppVersionNumber = getAppVersionNumber;
  getBuildNumber = getBuildNumber;
  commitHash = getCommitHash;
  easterEggCounter = 0;
  licenses = Licenses;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
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
