import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

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
