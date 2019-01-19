import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@Component({
  selector: '[madeHeader]',
  templateUrl: 'made-header.component.html'
})
export class MadeHeaderComponent {
  @Input() showHome: boolean;
  @Input() hideBackButton: boolean;
  @Input() isBackgroundTransparent: boolean;

  constructor(private navCtrl: NavController) {}

  goHome(): void {
    this.navCtrl.setRoot(PageNames.MainTabs);
  }
}
