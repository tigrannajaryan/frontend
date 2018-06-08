import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TodayService } from '~/today/today.service';
import { Appointment } from '~/today/today.models';
import { PageNames } from '~/core/page-names';

@IonicPage({ segment: 'appointment-checkout/:appointmentUuid' })
@Component({
  selector: 'page-checkout',
  templateUrl: 'appointment-checkout.component.html'
})
export class AppointmentCheckoutComponent {
  protected totalPrice = 0;
  protected withTax = false;
  protected withCardFee = false;
  protected appointment: Appointment;
  private appointmentUuid: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private todayService: TodayService
  ) {
    this.init();
  }

  async init(): Promise<void> {
    this.appointmentUuid = this.navParams.get('appointmentUuid');

    if (this.appointmentUuid) {
      this.appointment = await this.todayService.getAppointmentById(this.appointmentUuid);

      this.calcTotalPrice();
    }
  }

  protected onFinalizeCheckout(): void {
    this.navCtrl.setRoot(PageNames.Today, { appointmentUuid: this.appointmentUuid });
  }

  protected calcTotalPrice(): void {
    let taxAndCardFee = 0;
    if (this.withTax) {
      taxAndCardFee += this.appointment.total_tax;
    }

    if (this.withCardFee) {
      taxAndCardFee += this.appointment.total_card_fee;
    }

    this.totalPrice = Math.ceil(this.appointment.total_client_price_before_tax + taxAndCardFee);
  }
}
