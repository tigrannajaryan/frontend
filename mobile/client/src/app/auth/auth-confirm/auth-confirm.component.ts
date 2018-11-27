import { Component } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';

import { ConfirmCodeResponse } from '~/shared/api/auth.models';
import { AbstractAuthConfirmComponent } from '~/shared/components/auth/abstract-auth-confirm.component';
import { AuthDataStore } from '~/shared/storage/auth.data';
import { AuthProcessState } from '~/shared/storage/auth-process-state';

import { ClientStartupNavigation } from '~/core/client-startup-navigation';

@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm.component.html'
})
export class AuthConfirmPageComponent extends AbstractAuthConfirmComponent {

  constructor(
    protected auth: AuthDataStore,
    protected authDataState: AuthProcessState,
    protected clientNavigation: ClientStartupNavigation,
    protected events: Events,
    protected navCtrl: NavController,
    protected navParams: NavParams
  ) {
    super();
  }

  protected async onCodeConfirmed(response: ConfirmCodeResponse): Promise<void> {
    // Show the correct next page based on current status of the profile.
    const invitation = response.stylist_invitation && response.stylist_invitation[0];
    const showPage = await this.clientNavigation.nextToShowByProfileStatus(invitation);

    // We are using setPages() instead of push() because it is not allowed to go back
    // to the current page (the AuthConfirm).
    this.navCtrl.setPages([showPage]);
  }
}
