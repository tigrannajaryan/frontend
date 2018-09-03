import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'almost-done'
})
@Component({
  selector: 'page-almost-done',
  templateUrl: 'almost-done.component.html'
})
export class AlmostDoneComponent {
  PageNames = PageNames;

  constructor(
    private navCtrl: NavController
  ) {
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.Tabs);
  }
}
