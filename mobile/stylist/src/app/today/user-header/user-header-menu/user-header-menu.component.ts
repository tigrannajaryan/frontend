import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { PageNames } from '~/core/page-names';
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';

@Component({
  selector: '[madeUserHeaderMenu]',
  templateUrl: 'user-header-menu.component.html'
})
export class UserHeaderMenuComponent {

  constructor(
    private nav: NavController,
    private viewCtrl: ViewController,
    private authApiService: AuthApiService
  ) {}

  logout(): void {
    // Hide popover
    this.viewCtrl.dismiss();

    // Logout from backend
    this.authApiService.logout();

    // Erase all previous navigation history and make FirstScreen the root
    this.nav.setRoot(PageNames.FirstScreen);
  }
}
