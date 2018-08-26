import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'how-pricing'
})
@Component({
  selector: 'page-how-pricing',
  templateUrl: 'how-pricing-page.component.html'
})
export class HowPricingPageComponent {

  constructor(private navCtrl: NavController) {}

  protected onContinue(): void {
    this.navCtrl.push(PageNames.Home);
  }
}
