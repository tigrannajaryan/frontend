import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { getCommitHash } from '~/shared/get-build-info';
import { ENV } from '~/environments/environment.default';
import Licenses from '~/core/data/licenses.json';

@Component({
  selector: 'page-about',
  templateUrl: 'about.component.html'
})
export class AboutComponent {
  protected commitHash = getCommitHash;
  protected easterEggCounter = 0;
  protected licenses = Licenses;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
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
