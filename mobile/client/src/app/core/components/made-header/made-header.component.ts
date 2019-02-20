import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { MadeDisableOnClick } from '~/shared/utils/loading';

@Component({
  selector: '[madeHeader]',
  templateUrl: 'made-header.component.html'
})
export class MadeHeaderComponent {
  @Input() showHome: boolean;
  @Input() hideBackButton: boolean;
  @Input() isBackgroundTransparent: boolean;

  constructor(private navCtrl: NavController) {}

  @MadeDisableOnClick
  async goHome(): Promise<void> {
    await this.navCtrl.setRoot(PageNames.MainTabs);
  }
}
