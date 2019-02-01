import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { ClientAppointmentModel } from '~/shared/api/appointments.models';

export interface ConfirmCheckoutComponentParams {
  appointment: ClientAppointmentModel;
}

@Component({
  selector: 'pop-confirm-checkout',
  templateUrl: 'confirm-checkout.component.html'
})
export class ConfirmCheckoutComponent {
  params: ConfirmCheckoutComponentParams;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.params = this.navParams.get('params') as ConfirmCheckoutComponentParams;
  }

  onReturnToHome(): void {
    this.navCtrl.setRoot(PageNames.MainTabs);
  }
}
