import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { CheckOut } from '~/today/today.models';
import { PageNames } from '~/core/page-names';
import { TodayService } from '~/today/today.service';
import { loading } from '~/core/utils/loading';
import { showAlert } from '~/core/utils/alert';

interface CheckoutParams {
  appointmentUuid: string;
  body: CheckOut;
}

@IonicPage({ segment: 'appointment-checkout-finish' })
@Component({
  selector: 'pop-confirm-checkout',
  templateUrl: 'confirm-checkout.component.html'
})
export class ConfirmCheckoutComponent {
  private params: CheckoutParams;

  constructor(
    protected navCtrl: NavController,
    protected todayService: TodayService,
    protected alertCtrl: AlertController,
    protected navParams: NavParams
  ) {
  }

  ionViewDidEnter(): void {
    this.params = this.navParams.data as CheckoutParams;
  }

  @loading
  async onFinalizeCheckout(): Promise<void> {
    try {
      await this.todayService.setAppointment(this.params.appointmentUuid, this.params.body);
      this.navCtrl.setRoot(PageNames.Today);
    } catch (e) {
      showAlert(this.alertCtrl, 'e', e.message);
    }
  }
}
