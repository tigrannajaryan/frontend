import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { getBuildNumber } from '~/core/functions';
import { ENV } from '../../environments/environment.default';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.component.html'
})
export class AboutComponent {

  protected getBuildNumber = getBuildNumber;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  protected getEnv(): typeof ENV {
    return ENV;
  }

}
