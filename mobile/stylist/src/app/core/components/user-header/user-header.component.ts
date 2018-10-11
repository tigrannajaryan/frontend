import { Component, Input } from '@angular/core';
import { App, NavController, PopoverController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { StylistProfile } from '~/shared/stylist-api/stylist-models';
import { AuthApiService } from '~/shared/stylist-api/auth-api-service';
import { DataStore } from '~/shared/storage/data-store';
import { PageNames } from '~/core/page-names';
import { DataModule } from '~/core/data.module';
import { AppModule } from '~/app.module';
import { LogoutAction } from '~/app.reducers';
import { UserHeaderMenuActions, UserHeaderMenuComponent } from './user-header-menu/user-header-menu.component';

@Component({
  selector: '[madeUserHeader]',
  templateUrl: 'user-header.component.html'
})
export class UserHeaderComponent {
  @Input() profile: StylistProfile;

  constructor(
    public popoverCtrl: PopoverController,
    protected navCtrl: NavController,
    private app: App,
    private authApiService: AuthApiService,
    private store: Store<any>
  ) {
  }

  getToday(): Date {
    return new Date();
  }

  onProfileClick(): void {
    this.navCtrl.push(PageNames.RegisterSalon, { isMainScreen: true });
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

          // Clear cached data
          this.clearAllDataStores();

          // Erase all previous navigation history and make FirstScreen the root
          this.app.getRootNav().setRoot(PageNames.FirstScreen);
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

  private clearAllDataStores = (): void => {
    // Get all data store classes:
    const dataStores = DataModule.forRoot().providers;
    // Require one by one and clear it’s data:
    for (const storeClass of dataStores) {
      const store = AppModule.injector.get(storeClass);
      if (store instanceof DataStore) {
        // Just calling DataStore.prototype.clear:
        store.clear();
      } else {
        // Search for DataStore as a prop and call DataStore.prototype.clear on it:
        for (const propName of Object.getOwnPropertyNames(store)) {
          const prop = store[propName];
          if (prop instanceof DataStore) {
            prop.clear();
          }
        }
      }
    }
  };
}
