import { Component } from '@angular/core';
import { MenuController, ViewController } from 'ionic-angular';

export enum UserHeaderMenuActions {
  about,
  logout
}

@Component({
  selector: '[madeUserHeaderMenu]',
  templateUrl: 'user-header-menu.component.html'
})
export class UserHeaderMenuComponent {

  constructor(
    public menuCtrl: MenuController,
    private viewCtrl: ViewController
  ) {}

  logoutClick(): void {
    // Note: do not attempt to work with NavController here.
    // In popovers the NavController is a different instance
    // and attempting to call NavController.setRoot() to
    // return to FirstScreen will result in misterious and
    // spurious errors.
    // See solution here: https://github.com/ionic-team/ionic/issues/8437#issuecomment-260375966

    // Hide popover and report selected action
    this.viewCtrl.dismiss(UserHeaderMenuActions.logout);

    // hide the menu
    this.menuCtrl.enable(false);
  }

  aboutClick(): void {
    this.viewCtrl.dismiss(UserHeaderMenuActions.about);
  }
}
