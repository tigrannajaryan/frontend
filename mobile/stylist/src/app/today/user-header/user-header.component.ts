import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PageNames } from '~/core/page-names';

@Component({
  selector: 'user-header',
  templateUrl: 'user-header.component.html'
})
export class UserHeaderComponent {
  @Input() hasBackButton: boolean;

  constructor(private navCtrl: NavController) {

  }

  goToHome(): void {
    this.navCtrl.push(PageNames.Today);
  }
}
