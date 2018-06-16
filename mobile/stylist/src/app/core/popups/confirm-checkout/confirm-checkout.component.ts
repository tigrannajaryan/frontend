import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage({ segment: 'appointment-checkout-finish' })
@Component({
  selector: 'pop-confirm-checkout',
  templateUrl: 'confirm-checkout.component.html'
})
export class ConfirmCheckoutComponent {

  constructor(
    protected navCtrl: NavController
  ) {
  }
}
