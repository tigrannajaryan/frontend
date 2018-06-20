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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  protected getEnv(): typeof ENV {
    return ENV;
  }

}
