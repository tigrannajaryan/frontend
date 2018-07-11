import { Component } from '@angular/core';
import { App, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@Component({
  selector: '[madeUserFooter]',
  templateUrl: 'user-footer.component.html'
})
export class UserFooterComponent {
  protected activePage: PageNames;
  protected PageNames = PageNames;

  constructor(private navCtrl: NavController, private app: App) {
    this.app.viewDidLoad.subscribe(() => {
      this.activePage = this.navCtrl.getActive().name as PageNames;
    });
  }

}
