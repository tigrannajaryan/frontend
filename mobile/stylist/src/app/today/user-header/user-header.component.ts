import { Component, Input } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { StylistProfile } from '~/core/stylist-service/stylist-models';

import { TodayComponent } from '~/today/today.component';
import { UserHeaderMenuActions, UserHeaderMenuComponent } from './user-header-menu/user-header-menu.component';
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';
import { LogoutAction } from '~/app.reducers';

@Component({
  selector: '[madeUserHeader]',
  templateUrl: 'user-header.component.html'
})
export class UserHeaderComponent {
  @Input() hasBackButton: boolean;
  @Input() hasShadow: boolean;
  @Input() profile: StylistProfile;

  protected PageNames = PageNames;

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

  goToHome(): void {
    const previous = this.navCtrl.getPrevious();
    if (previous && previous.component === TodayComponent) {
      // When click on house icon navigate back if previous route is Today
      this.navCtrl.pop();
    } else {
      this.navCtrl.push(PageNames.Today);
    }
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
}
