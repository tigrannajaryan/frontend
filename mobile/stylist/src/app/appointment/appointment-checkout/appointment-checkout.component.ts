import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TodayService } from '~/today/today.service';
import { Appointment } from '~/today/today.models';

@IonicPage({ segment: 'appointment-checkout' })
@Component({
  selector: 'page-checkout',
  templateUrl: 'appointment-checkout.component.html'
})
export class AppointmentCheckoutComponent {
  uuid: string;
  appointment: Appointment;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private todayService: TodayService
  ) {
    this.init();
  }

  async init(): Promise<void> {
    this.uuid = this.navParams.get('uuid');

    if (this.uuid) {
      this.appointment = await this.todayService.getAppointmentById(this.uuid);
    }
  }

  onFinalizeCheckout(): void {
    this.viewCtrl.dismiss(true);
  }
}
