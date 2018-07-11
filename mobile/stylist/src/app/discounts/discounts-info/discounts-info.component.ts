import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'discounts-info'
})
@Component({
  selector: 'page-discounts-info',
  templateUrl: 'discounts-info.component.html'
})
export class DiscountsInfoComponent {
  protected PageNames = PageNames;

  constructor(private navCtrl: NavController) {}

  protected onContinue(): void {
    this.navCtrl.push(PageNames.DiscountsWeekday);
  }
}
