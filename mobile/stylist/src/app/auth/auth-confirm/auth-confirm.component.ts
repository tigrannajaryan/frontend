import { Component } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';

import { ConfirmCodeResponse } from '~/shared/api/auth.models';
import { AbstractAuthConfirmComponent } from '~/shared/components/auth/abstract-auth-confirm.component';
import { AuthDataStore } from '~/shared/storage/auth.data';
import { AuthProcessState } from '~/shared/storage/auth-process-state';

import { clearAllDataStores } from '~/core/data.module';
import { createNavHistoryList, isRegistrationComplete } from '~/core/functions';
import { StylistAppStorage } from '~/core/stylist-app-storage';
import { StylistEventTypes } from '~/core/stylist-event-types';

@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm.component.html'
})
export class AuthConfirmPageComponent extends AbstractAuthConfirmComponent {

  constructor(
    protected auth: AuthDataStore,
    protected authDataState: AuthProcessState,
    protected events: Events,
    protected navCtrl: NavController,
    protected navParams: NavParams,
    private storage: StylistAppStorage
  ) {
    super();
  }

  protected async onCodeConfirmed(response: ConfirmCodeResponse): Promise<void> {
    // Clear cached data when logging in. This is to avoid using previous user's
    // cached data if we login using a different user. We also clear cache during
    // logout, but it may not be enough since it is possible to be forcedly logged
    // out without performing logout user action (e.g. on token expiration).
    await clearAllDataStores();

    // Resubscrube to profile DataStore is needed in menu after storage was cleared out:
    this.events.publish(StylistEventTypes.menuUpdateProfileSubscription);

    // true = This is a new user, enable help screens
    // false = Set it back to false for the case when we change user
    this.storage.set('showHomeScreenHelp', !isRegistrationComplete(response.profile_status));

    const requiredPages = createNavHistoryList(response.profile_status);
    this.navCtrl.setPages(requiredPages);
  }
}
