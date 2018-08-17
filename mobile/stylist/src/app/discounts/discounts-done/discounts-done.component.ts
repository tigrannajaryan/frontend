import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'discounts-done'
})
@Component({
  selector: 'page-discounts-done',
  templateUrl: 'discounts-done.component.html'
})
export class DiscountsDoneComponent {
  PageNames = PageNames;

  constructor(
    private navCtrl: NavController
  ) {
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.Invitations);
  }
}
