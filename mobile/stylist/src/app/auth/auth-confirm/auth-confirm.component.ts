import { Component } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';

import { AuthService } from '~/shared/api/auth.api';
import { ConfirmCodeResponse } from '~/shared/api/auth.models';
import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { AbstractAuthConfirmComponent } from '~/shared/components/auth/abstract-auth-confirm.component';
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
    protected auth: AuthService,
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

    // Resubscribe to profile DataStore is needed in menu after storage was cleared out
    // because clearAllDataStores invalidates all existing subscriptions.
    this.events.publish(StylistEventTypes.menuUpdateProfileSubscription);

    const profileStatus = response.profile_status as StylistProfileStatus;

    // true = This is a new user, enable help screens
    // false = Set it back to false for the case when we change user
    this.storage.set('showHomeScreenHelp', !isRegistrationComplete(profileStatus));

    const requiredPages = await createNavHistoryList(profileStatus);
    this.navCtrl.setPages(requiredPages);
  }
}
