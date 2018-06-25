import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
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
