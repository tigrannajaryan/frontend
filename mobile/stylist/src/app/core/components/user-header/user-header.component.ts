import { Component, Input } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { StylistProfile } from '~/core/stylist-service/stylist-models';
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';
import { UserHeaderMenuActions, UserHeaderMenuComponent } from './user-header-menu/user-header-menu.component';
import { LogoutAction } from '~/app.reducers';

@Component({
  selector: '[madeUserHeader]',
  templateUrl: 'user-header.component.html'
})
export class UserHeaderComponent {
  @Input() profile: StylistProfile;

  constructor(
    public popoverCtrl: PopoverController,
    protected navCtrl: NavController,
    private authApiService: AuthApiService,
    private store: Store<any>
  ) {
  }

  getToday(): Date {
    return new Date();
  }

  protected openPopover(myEvent: Event): void {
    const popover = this.popoverCtrl.create(UserHeaderMenuComponent);

    popover.onDidDismiss((action: UserHeaderMenuActions) => {

      switch (action) {
        case UserHeaderMenuActions.logout:
          // Logout from backend
          this.authApiService.logout();

          // Dismiss user’s state
          this.store.dispatch(new LogoutAction());

          // Erase all previous navigation history and make FirstScreen the root
          this.navCtrl.setRoot(PageNames.FirstScreen);
          break;

        case UserHeaderMenuActions.about:
          this.navCtrl.push(PageNames.About);
          break;

        default:
          break;
      }
    });

    popover.present({
      ev: myEvent
    });
  }

  onProfileClick(): void {
    this.navCtrl.push(PageNames.RegisterSalon, { isMainScreen: true });
  }
}
