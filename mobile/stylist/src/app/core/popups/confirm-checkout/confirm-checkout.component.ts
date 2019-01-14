import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { InvitationsComponentParams } from '~/shared/components/invitations/abstract-invitations.component';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'pop-confirm-checkout',
  templateUrl: 'confirm-checkout.component.html'
})
export class ConfirmCheckoutComponent {

  constructor(
    private navCtrl: NavController
  ) {
  }

  onReturnToHome(): void {
    this.navCtrl.setRoot(PageNames.HomeSlots);
  }

  onInviteClients(): void {
    const params: InvitationsComponentParams = { isRootPage: true };
    this.navCtrl.setRoot(PageNames.Invitations, { params });
  }
}
